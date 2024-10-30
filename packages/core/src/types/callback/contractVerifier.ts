import { Address } from 'viem'

/**
 * Information about a contract.
 */
type ContractInfo = {
  /**
   * The address of the contract.
   */
  address: Address
  /**
   * Optional constructor arguments for the contract.
   */
  constructorArgs?: any[]
}

/**
 * Parameters for the block explorer.
 */
type BlockExplorerParams = {
  /**
   * Optional API key for the block explorer.
   */
  apiKey?: string
  /**
   * The API URL for the block explorer.
   */
  apiUrl: string
  /**
   * The URL for the block explorer.
   */
  url: string
}

/**
 * Parameters for callback events.
 */
type ContractVerifierCallbackParams = {
  /**
   * Information about the total number of contracts to verify.
   */
  contractVerificationInfo: { totalContracts: number }
  /**
   * Event emitted when a contract verification starts.
   * Contains the contract name and the contract address to verify.
   */
  contractVerificationStarted: { contractName: string; address: Address }
  /**
   * Event emitted when a contract verification submits.
   * Contains the contract name, the contract address to verify, and the GUID of the verification.
   */
  contractVerificationSubmitted: { contractName: string; address: Address; guid: string }
  /**
   * Event emitted when a contract verification finishes.
   * Contains the contract name, the contract address to verify, and the URL of that contract.
   * Also indicates if the contract was already verified.
   */
  contractVerificationFinished: { contractName: string; address: Address; url: string; isAlreadyVerified: boolean }
}

/**
 * Keys for callback parameters.
 */
type CallbackKeys = keyof ContractVerifierCallbackParams

/**
 * Callback function for contract verification events.
 *
 * @template T - The type of the callback key.
 * @param key - The key of the callback event.
 * @param value - The value associated with the callback event.
 * @returns A promise that resolves when the callback is complete.
 */
type ContractVerifierCallback = <T extends CallbackKeys>(key: T, value: ContractVerifierCallbackParams[T]) => Promise<void>

export { BlockExplorerParams, ContractInfo, ContractVerifierCallback, ContractVerifierCallbackParams }
