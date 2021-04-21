import { CustomError } from 'ts-custom-error'

export class UnsupportException extends CustomError {
  constructor(message: string) {
    super(message)
    Object.defineProperty(this, 'name', { value: 'UnsupportException' })
  }
}
