import path from 'path';

import type { Artifacts, ArtifactsMap } from 'hardhat/types/artifacts';

import { name } from '@/package.json';
import { splitAuxdata } from "@ethereum-sourcify/bytecode-utils";
import { InfinitCallback, InfinitWallet } from '@infinit-xyz/core';
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan';
import { ContractInformation, extractMatchingContractInformation, LibraryToAddress, SourceToLibraryToAddress } from '@nomicfoundation/hardhat-verify/internal/solc/artifacts';
import { Bytecode } from '@nomicfoundation/hardhat-verify/internal/solc/bytecode';
import { encodeArguments } from '@nomicfoundation/hardhat-verify/internal/utilities';
import { resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode';
import axios from 'axios';
import { Artifacts as ArtifactsFromPath } from 'hardhat/internal/artifacts';
import { Address } from 'viem';
import { moduleDir } from '../constants';
import { readArtifact } from './artifact';

type ContractInfo = {
    address: Address
    constructorArgs?: any[]
}

const getArtifacts = async (): Promise<Artifacts> => {
  //Use moduleDir only when testing for vitest.
  const artifactsBase = process.env.NODE_ENV === 'test' ? moduleDir : process.cwd()
  const artifacts: Artifacts = new ArtifactsFromPath(path.join(artifactsBase, `./artifacts/${path.basename(name)}`))
  return artifacts
}

const getContractInformation = async (client: InfinitWallet, contract: { address: Address }) => {
    // get deploy bytecode from chain
    const code = await client.publicClient.getCode({address: contract.address})
    if (!code) {
        throw new Error(`No deployed bytecode found at address ${contract.address}`)
    }
    const deployedBytecode = code.replace(/^0x/, "");
    const bytecode = new Bytecode(deployedBytecode)

    let contractInformation: ContractInformation | null = null;
    const artifacts = await getArtifacts();
    const fqNames = await artifacts.getAllFullyQualifiedNames();

    for (const fqName of fqNames) {
        const buildInfo = await artifacts.getBuildInfo(fqName);

        if (buildInfo === undefined) continue;

        // Normalize deployed bytecode according to this object        
        contractInformation = extractMatchingContractInformation(
            fqName,
            buildInfo,
            bytecode
        );

        if (contractInformation !== null) {
            break
        }
    }
    if (contractInformation === null) {
        throw new Error(`No matching contract found for address ${contract.address}`)
    }
    return contractInformation
}

const getContractCreationCode = async (instance: Etherscan, address: Address ) => {
    // get deployment tx from etherscan
    const parameters = new URLSearchParams({
      apiKey: instance.apiKey!,
      module: "account",
      action: "txlist",
      startblock: "0",
      endblock: "latest",
      sort: "asc",
      address,
    });
    const url = new URL(instance.apiUrl);
    url.search = parameters.toString();
    let contractCreationCode: string = ""
    await axios.get(url.toString()).then((response: any) => {
        const data = response.data
        for (const tx of data.result) {
            // find contract creation tx
            if (tx.to === "") {
                contractCreationCode = tx.input
                break
            }
        }
    }).catch((error: any) => {
        throw new Error(error);
    })
    if (contractCreationCode === "") {
        throw new Error(`No contract creation code found for contract at address ${address}`)
    }
    return contractCreationCode
}

const getCreationCodeWithOutMetadata = async (creationCode: string, deployedBytecode: string) => {
    // replace 0x with empty string
    creationCode = creationCode.replace("0x", "")
    const hexStrings = await splitAuxdata(deployedBytecode)
    // use metadata as splitter if it exists
    const splitter: string = hexStrings.length === 3 ? hexStrings[1] + hexStrings[2] : ""
    // split contract creation code with splitter
    const splittedCodeList = creationCode.split(splitter)
    // join back to string without metadata
    return splittedCodeList.join("")
}

const getConstructorArgsFromCreationCode = async (instance: Etherscan, address: Address, contractInformation: ContractInformation) => {
    const contractCreationCode = await getContractCreationCode(instance, address)
    const onChainCreationCode = await getCreationCodeWithOutMetadata(contractCreationCode, contractInformation.deployedBytecode)
    const artifactCreationCode = await getCreationCodeWithOutMetadata(contractInformation.contractOutput.evm.bytecode.object, contractInformation.contractOutput.evm.deployedBytecode.object)
    
    // replace artifactCreationCode in onChainCreationCode with empty string
    const encodedConstructorArgs = onChainCreationCode.replace(artifactCreationCode, "")
    return encodedConstructorArgs
}

const resolveLinkedLibraries = async (contractInformation: ContractInformation): Promise<ContractInformation> => {
    const libraries: SourceToLibraryToAddress = {}
    const librariesAddress: LibraryToAddress = {}
    const linkReferences = contractInformation.contractOutput.evm.deployedBytecode.linkReferences
    for (const [sourceName, librariesToIndex] of Object.entries(linkReferences)) {
        for (const [libraryName, indexes] of Object.entries(librariesToIndex)) {
            const startIndex = indexes[0].start
            const length = indexes[0].length
            // slice library address from deployed bytecode using link references
            const libraryAddress = "0x" + contractInformation.deployedBytecode.slice(startIndex * 2, (startIndex + length) * 2)
            if (libraries[sourceName] === undefined) {
                libraries[sourceName] = {}
            }
            libraries[sourceName][libraryName] = libraryAddress
            librariesAddress[libraryName] = libraryAddress
        }
    }
    // if there are linked lib
    if (Object.keys(librariesAddress).length > 0) {
        const contractFQN = `${contractInformation.sourceName}:${contractInformation.contractName}`;
        const artifact = await readArtifact(contractFQN as keyof ArtifactsMap) 
        contractInformation.contractOutput.evm.bytecode.object = await resolveBytecodeWithLinkedLibraries(artifact, librariesAddress) 
    }
    contractInformation.compilerInput.settings.libraries = libraries
    return contractInformation
}

const verifyContract = async (client: InfinitWallet, instance: Etherscan, contract: ContractInfo, callback?: InfinitCallback) => {
    // check if contract is already verified
    if (await instance.isVerified(contract.address)) return
    // get contract information
    let contractInformation = await getContractInformation(client, contract)
    await callback?.('contractVerificationStarted', {
        contractName: contractInformation.contractName,
        address: contract.address
    })
    // resolve linked libraries
    contractInformation = await resolveLinkedLibraries(contractInformation)
    // get encoded constructor arguments
    const encodedConstructorArgs: string = contract.constructorArgs ? await encodeArguments(
        contractInformation.contractOutput.abi,
        contractInformation.sourceName,
        contractInformation.contractName,
        contract.constructorArgs
    ) : await getConstructorArgsFromCreationCode(instance, contract.address, contractInformation)
    // verify contract
    const contractFQN = `${contractInformation.sourceName}:${contractInformation.contractName}`;
    const { message: guid } = await instance.verify(
        contract.address,
        JSON.stringify(contractInformation.compilerInput),
        contractFQN,
        `v${contractInformation.solcLongVersion}`,
        encodedConstructorArgs
    );
    await callback?.('contractVerificationSubmitted', {
        contractName: contractInformation.contractName,
        address: contract.address,
        guid
    })
    
    // wait for 1 second before checking the status (avoid rate limiting)
    await setTimeout(() => {}, 1000);

    const verificationStatus = await instance.getVerificationStatus(guid);

    const isSuccess = verificationStatus.isSuccess()

    if (isSuccess) {
        await callback?.('contractVerificationFinished', {
            contractName: contractInformation.contractName,
            address: contract.address,
            url : instance.browserUrl
        })
    } else {
        throw new Error(`Failed to verify contract ${contractInformation.contractName} on the block explorer. at contract address: ${contract.address}`);
    }
}

export { ContractInfo, verifyContract };

