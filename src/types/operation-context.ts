import { OpenAPIV3 } from 'openapi-types'
import { FileNamingStyle } from './file-naming-style.js'


export interface OperationContext {
  pathname: string
  method: string
  operation: OpenAPIV3.OperationObject

  document: OpenAPIV3.Document
  moduleName: string
  fileNamingStyle: FileNamingStyle
}
