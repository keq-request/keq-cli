import { CustomError } from 'ts-custom-error'

export class NotFoundException extends CustomError {
  constructor(message: string) {
    super(message)
    Object.defineProperty(this, 'name', { value: 'NotFoundException' })
  }
}
