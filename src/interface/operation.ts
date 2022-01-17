import { OpenAPIV3 } from 'openapi-types'
import { Model } from './model'
import { Schema } from './schema'


export interface OperationParam extends OpenAPIV3.ParameterObject {
  required: boolean

  isQuery: boolean
  isHeader: boolean
  isParam: boolean
  isBody: boolean

  model?: Model
}

export interface OperationResponse {
  code: string
  description?: string

  headers: OperationParam[]
  content: Schema
  dependencies: Model[]

  last: boolean
}

export interface Operation extends Omit<OpenAPIV3.OperationObject, 'responses' | 'description'> {
  descriptions: string[]
  nickname: string
  pathname: string
  method: string


  parameters: OperationParam[]
  request: Schema
  responses: OperationResponse[]

  dependencies: Model[]
}
