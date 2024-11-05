import { privateKeyToAccount } from 'viem/accounts'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { DeployInitCapitalAction } from '@actions/deployInitCapital'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

export const setupInitCapital = async (): Promise<InitCapitalRegistry> => {
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client = new TestInfinitWallet(TestChain.arbitrum, account.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)
  const deployer = client.walletClient.account.address
  const accessControlManagerOwner = client.walletClient.account.address
  const weth = ARBITRUM_TEST_ADDRESSES.weth

  const deployInitCapitalAction = new DeployInitCapitalAction({
    params: {
      proxyAdminOwner: accessControlManagerOwner,
      wrappedNativeToken: weth,
      posManagerNftName: 'Init Position',
      posManagerNftSymbol: 'inPOS',
      maxCollCount: 5,
      maxLiqIncentiveMultiplier: 100n,
      governor: accessControlManagerOwner,
      guardian: deployer,
      feeAdmin: accessControlManagerOwner,
      treasury: accessControlManagerOwner,
      doubleSlopeIRMConfigs: [
        {
          name: 'StablecoinIRM',
          params: {
            baseBorrowRateE18: 100000000000000000n,
            jumpUtilizationRateE18: 800000000000000000n,
            borrowRateMultiplierE18: 10000000000000000n,
            jumpRateMultiplierE18: 10000000000000000n,
          },
        },
        {
          name: 'MajorcoinIRM',
          params: {
            baseBorrowRateE18: 100000000000000000n,
            jumpUtilizationRateE18: 600000000000000000n,
            borrowRateMultiplierE18: 10000000000000000n,
            jumpRateMultiplierE18: 10000000000000000n,
          },
        },
      ],
    },
    signer: {
      deployer: client,
      accessControlManagerOwner: client2,
    },
  })

  return await deployInitCapitalAction.run({})
}
