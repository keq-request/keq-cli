/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as R from 'ramda'
import * as changeCase from 'change-case'
import * as Handlebars from 'handlebars'
import { JSONPath } from 'jsonpath-plus'
import { readTemplate } from './read-template'
import { OpenAPIV3 } from 'openapi-types'
import { getOperationId } from './get-operation-id'
import * as HandlebarsRamdaHelpers from 'handlebars-ramda-helpers'


Handlebars.registerPartial('t_shape', readTemplate('shape'))
Handlebars.registerPartial('t_shape__enum', readTemplate('shape/enum'))
Handlebars.registerPartial('t_shape__object', readTemplate('shape/object'))
Handlebars.registerPartial('t_shape__array', readTemplate('shape/array'))
Handlebars.registerPartial('t_shape__one_of', readTemplate('shape/one-of'))
Handlebars.registerPartial('t_shape__any_of', readTemplate('shape/any-of'))
Handlebars.registerPartial('t_shape__all_of', readTemplate('shape/all-of'))
Handlebars.registerPartial('t_comments', readTemplate('comments'))
Handlebars.registerPartial('t_interface', readTemplate('interface'))


HandlebarsRamdaHelpers.register(Handlebars)

function pickRef(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string[] {
  const refs: string[] = []
  if ('oneOf' in schema && schema.oneOf) {
    refs.push(...R.unnest(R.map(pickRef, schema.oneOf)))
  }
  if ('anyOf' in schema && schema.anyOf) {
    refs.push(...R.unnest(R.map(pickRef, schema.anyOf)))
  }
  if ('allOf' in schema && schema.allOf) {
    refs.push(...R.unnest(R.map(pickRef, schema.allOf)))
  }
  if ('$ref' in schema) {
    refs.push(schema.$ref)
  }
  if ('properties' in schema && schema.properties) {
    refs.push(...R.unnest(Object.values(schema.properties).map(pickRef)))
  }
  if ('additionalProperties' in schema && typeof schema.additionalProperties === 'object') {
    refs.push(...pickRef(schema.additionalProperties))
  }
  if ('type' in schema && schema.type === 'array') {
    if (Array.isArray(schema.items)) {
      refs.push(...R.unnest(schema.items.map(pickRef)))
    } else if (schema.items) {
      refs.push(...pickRef(schema.items))
    }
  }

  return R.uniq(refs)
}

function getRef<T>(ref: OpenAPIV3.ReferenceObject, api: OpenAPIV3.Document): T | undefined {
  let value

  for (const key of ref.$ref.split('/')) {
    if (key === '#') {
      value = api
    } else {
      value = value[key]
    }

    if (!value) break
  }

  return value as T
}

function parseSchema(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject, api: OpenAPIV3.Document): OpenAPIV3.SchemaObject {
  if ('$ref' in schema) {
    const result = getRef<OpenAPIV3.SchemaObject>(schema, api)
    if (!result) throw new Error(`Could not resolve reference: ${schema.$ref}`)
    return result
  } else {
    return schema
  }
}


Handlebars.registerHelper('change-case', (fileNamingStyle: string, filename: string) => changeCase[fileNamingStyle](filename))
Handlebars.registerHelper('parse-schema', (schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject, options: Handlebars.HelperOptions) => parseSchema(schema, options.data.root.api))
Handlebars.registerHelper('operation-id', getOperationId)


function wrap(fn) {
  return (...args) => fn(...R.dropLast(1, args))
}


Handlebars.registerHelper('json-path', wrap((path, json) => JSONPath({ path, json })))
Handlebars.registerHelper('pick-ref', wrap(R.curry(pickRef)))
Handlebars.registerHelper('ref-name', wrap(R.curry((ref: string) => R.last(ref.split('/')))))


Handlebars.registerHelper('or', (...args) => {
  const arr = R.dropLast(1, args)
  return R.any(R.identity, arr)
})
Handlebars.registerHelper('stringify', value => JSON.stringify(value, null, 2))
Handlebars.registerHelper('regexp', (str, options: Handlebars.HelperOptions) => new RegExp(str, options.hash.flags))
Handlebars.registerHelper('newline', () => '\n')
export default Handlebars
