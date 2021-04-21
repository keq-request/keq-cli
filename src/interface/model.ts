import { OpenAPIV3 } from 'openapi-types'
import { Property } from './property'


export interface Model extends Omit<OpenAPIV3.BaseSchemaObject, 'properties'> {
  isAny: boolean
  // isString: boolean
  isInt: boolean
  isNumber: boolean
  isBoolean: boolean
  isObject: boolean
  isArray: boolean
  isTuple: boolean

  // isString || isNumber || isInt || isBoolean
  isBasicDataType: boolean
  basicDataType?: string
  jsDocDataType: string

  deprecated: boolean
  readOnly: boolean
  writeOnly: boolean

  hasProperties: boolean
  additionalPropertiesType?: string
  properties?: Property[]
  tuple?: Model[]
  items?: Model

  isRef: boolean
  ref?: string
  refFilename?: string

  // all children ref
  dependencies: Model[]

  isIntersectionTypes: boolean
  intersectionTypes: Model[]

  isUnionTypes: boolean
  unionTypes: Model[]

  last: boolean
}
