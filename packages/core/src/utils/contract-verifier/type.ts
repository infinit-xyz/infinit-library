import { Address } from 'viem'

type ContractInfo = {
  address: Address
  constructorArgs?: any[]
}

type BlockExplorerParams = {
  apiKey?: string
  apiUrl: string
  url: string
}

type CallbackParams = {
  /**
   * Event emitted when a contract verification starts.
   * Contains the contract name and the contract address to verify
   */
  contractVerificationStarted: { contractName: string; address: Address }
  /**
   * Event emitted when a contract verification submits
   * Contains the the contract name and the contract address to verify and guid of verification
   */
  contractVerificationSubmitted: { contractName: string; address: Address; guid: string }
  /**
   * Event emitted when a contract verification finished.
   * Contain the contract name and the contract address to verify and url of that contract
   */
  contractVerificationFinished: { contractName: string; address: Address; url: string }
}

/**
 * Keys for callback parameters.
 */
type CallbackKeys = keyof CallbackParams

type ContractVerifierCallback = <T extends CallbackKeys>(key: T, value: CallbackParams[T]) => Promise<void>

export { BlockExplorerParams, ContractInfo, ContractVerifierCallback }
