import { OpenAPI, OpenAPIV3 } from 'openapi-types'
import { removeUnnecessaryRef } from './remove-unnecessary-ref'
import { toSwagger3 } from './to-swagger3'
import { fixSwagger } from 'swagger-fix'
import { validateSwagger3 } from './validate-swagger3'

export async function disinfect(swagger: OpenAPI.Document): Promise<OpenAPIV3.Document> {
  let swagger3 = await toSwagger3(swagger)
  swagger3 = fixSwagger(swagger3)

  removeUnnecessaryRef(swagger3)

  return validateSwagger3(swagger3)
}
