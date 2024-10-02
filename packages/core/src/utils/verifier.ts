
import type { Artifacts } from 'hardhat/types/artifacts';

import { InfinitCallback } from '@/types/callback';
import { splitAuxdata } from '@ethereum-sourcify/bytecode-utils';
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan.js';
import { ContractInformation, extractMatchingContractInformation, LibraryToAddress, SourceToLibraryToAddress } from '@nomicfoundation/hardhat-verify/internal/solc/artifacts.js';
import { Bytecode } from '@nomicfoundation/hardhat-verify/internal/solc/bytecode.js';
import { Libraries, resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode.js';
import { Address, PublicClient } from 'viem';

type ContractInfo = {
    address: Address
    constructorArgs?: any[]
}

const getContractInformation = async (client: PublicClient, artifacts: Artifacts, contract: { address: Address }) => {
    // get deploy bytecode from chain
    const code = await client.getCode({address: contract.address})
    if (!code) {
        throw new Error(`No deployed bytecode found at address ${contract.address}`)
    }
    const deployedBytecode = code.replace(/^0x/, "");
    const bytecode = new Bytecode(deployedBytecode)

    let contractInformation: ContractInformation | null = null;
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

const resolveLinkedLibraries = async (artifacts: Artifacts, contractInformation: ContractInformation): Promise<ContractInformation> => {
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
        const artifact = await artifacts.readArtifact(contractFQN) 
        contractInformation.contractOutput.evm.bytecode.object = await resolveBytecodeWithLinkedLibraries(artifact, librariesAddress as Libraries<Address>) 
    }
    contractInformation.compilerInput.settings.libraries = libraries
    return contractInformation
}

const verifyContract = async (client: PublicClient, instance: Etherscan, artifacts: Artifacts, contract: ContractInfo, callback?: InfinitCallback) => {
    // check if contract is already verified
    if (await instance.isVerified(contract.address)) return
    // get contract information
    let contractInformation = await getContractInformation(client, artifacts, contract)
    await callback?.('contractVerificationStarted', {
        contractName: contractInformation.contractName,
        address: contract.address
    })
    // resolve linked libraries
    contractInformation = await resolveLinkedLibraries(artifacts, contractInformation)
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

