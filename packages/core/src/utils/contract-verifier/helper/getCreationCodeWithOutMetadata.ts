import { splitAuxdata } from '@ethereum-sourcify/bytecode-utils'

export const getCreationCodeWithOutMetadata = async (creationCode: string, deployedBytecode: string) => {
  // replace 0x with empty string
  creationCode = creationCode.replace('0x', '')
  const hexStrings = await splitAuxdata(deployedBytecode)
  // use metadata as splitter if it exists
  const splitter: string = hexStrings.length === 3 ? hexStrings[1] + hexStrings[2] : ''
  // split contract creation code with splitter
  const splittedCodeList = creationCode.split(splitter)
  // join back to string without metadata
  return splittedCodeList.join('')
}
