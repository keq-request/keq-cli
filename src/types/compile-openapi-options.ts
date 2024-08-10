import { CompileOptions } from './compile-options.js'
import { OpenAPI } from 'openapi-types'


export interface CompileOpenapiOptions extends Omit<CompileOptions, 'filepath'> {
  document: OpenAPI.Document
}
