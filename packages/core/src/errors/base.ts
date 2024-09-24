// ref: https://github.com/wevm/viem/blob/main/src/errors/base.ts
import { name as coreName, version as coreVersion } from 'package.json'

//TODO: add error code: eg. HH01: ...

export type ProtocolModuleVersionDetail = {
  name: string
  version: string
}

type BaseErrorParameters = {
  cause?: BaseError | Error | undefined
  details?: string | undefined
  name?: string | undefined
}

export type BaseErrorType = BaseError & { name: 'BaseError' }
export class BaseError extends Error {
  details: string
  metaMessages?: string[] | undefined
  shortMessage: string
  version: string

  override name = 'BaseError'

  constructor(shortMessage: string, args: BaseErrorParameters = {}) {
    const details = (() => {
      if (args.cause instanceof BaseError) return args.cause.details
      if (args.cause?.message) return args.cause.message
      return args.details!
    })()

    const message = [
      shortMessage || 'An error occurred.',
      '',
      ...(details ? [`Details: ${details}`] : []),
      `${coreName}: ${coreVersion}`,
    ].join('\n')

    super(message, args.cause ? { cause: args.cause } : undefined)

    this.details = details
    this.name = args.name ?? this.name
    this.shortMessage = shortMessage
    this.version = coreVersion
  }
}
