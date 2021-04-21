import { CustomError } from 'ts-custom-error'

export class NamingConflictException extends CustomError {
  constructor(ref: string) {
    super(`Cannot find $ref=${ref} in the swagger document`)
    Object.defineProperty(this, 'name', { value: 'NamingConflictException' })
  }
}
