import { TransactionReceipt } from 'viem'

// anvil tester pk
const MOCK_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

const BASE_TRANSACTION_RECEIPT: TransactionReceipt = {
  status: 'success',
  transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  blockNumber: 0n,
  contractAddress: undefined,
  cumulativeGasUsed: 0n,
  effectiveGasPrice: 0n,
  from: '0x1234',
  gasUsed: 0n,
  logs: [],
  logsBloom: '0x1234',
  to: null,
  transactionIndex: 0,
  type: 'legacy',
}

export { MOCK_PRIVATE_KEY, BASE_TRANSACTION_RECEIPT }
