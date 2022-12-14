import { OpenAPIV3 } from 'openapi-types'


export function getOperationId(pathname: string, method: string, operation: OpenAPIV3.OperationObject): string {
  if (operation.operationId && operation.operationId !== 'index') {
    return operation.operationId
  }

  return `${method}_${pathname}`
    .replace('/', '_')
    .replace('-', '_')
    .replace(':', '$$')
    .replace(/{(.+)}/, '$$$1')
}
