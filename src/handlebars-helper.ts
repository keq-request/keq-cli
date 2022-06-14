/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as R from 'ramda'
import * as changeCase from 'change-case'
import * as Handlebars from 'handlebars'
import { readTemplate } from './read-template'
import { OpenAPIV3 } from 'openapi-types'


Handlebars.registerPartial('t_shape', readTemplate('shape'))
Handlebars.registerPartial('t_shape__enum', readTemplate('shape/enum'))
Handlebars.registerPartial('t_shape__object', readTemplate('shape/object'))
Handlebars.registerPartial('t_shape__array', readTemplate('shape/array'))
Handlebars.registerPartial('t_shape__one_of', readTemplate('shape/one-of'))
Handlebars.registerPartial('t_shape__any_of', readTemplate('shape/any-of'))
Handlebars.registerPartial('t_shape__all_of', readTemplate('shape/all-of'))
Handlebars.registerPartial('t_comments', readTemplate('comments'))
Handlebars.registerPartial('t_interface', readTemplate('interface'))


function pickRef(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string[] {
  if ('oneOf' in schema && schema.oneOf) {
    return R.unnest(R.map(pickRef, schema.oneOf))
  } else if ('anyOf' in schema && schema.anyOf) {
    return R.unnest(R.map(pickRef, schema.anyOf))
  } else if ('allOf' in schema && schema.allOf) {
    return R.unnest(R.map(pickRef, schema.allOf))
  } else if ('$ref' in schema) {
    return [schema.$ref]
  } else if (schema.properties) {
    return R.unnest(Object.values(schema.properties).map(pickRef))
  } else if (schema.type === 'array') {
    if (Array.isArray(schema.items)) {
      return R.unnest(schema.items.map(pickRef))
    } else {
      return pickRef(schema.items)
    }
  }

  return []
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


Handlebars.registerHelper('ref-name', (ref: string) => R.last(ref.split('/')))
Handlebars.registerHelper('change-case', (fileNamingStyle: string, filename: string) => changeCase[fileNamingStyle](filename))
Handlebars.registerHelper('parse-schema', (schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject, options: Handlebars.HelperOptions) => parseSchema(schema, options.data.root.options.api))


function wrap(fn) {
  return (...args) => fn(...R.dropLast(1, args))
}


Handlebars.registerHelper('pick-ref', wrap(R.curry(pickRef)))

Handlebars.registerHelper('is-empty', wrap(R.isEmpty))
Handlebars.registerHelper('is-nil', wrap(R.isNil))
Handlebars.registerHelper('all', wrap(R.all))
Handlebars.registerHelper('concat', wrap(R.concat))
Handlebars.registerHelper('complement', wrap(R.complement))
Handlebars.registerHelper('propEq', wrap(R.propEq))
Handlebars.registerHelper('flatten', wrap(R.flatten))
Handlebars.registerHelper('filter', wrap(R.filter))
Handlebars.registerHelper('unnest', wrap(R.unnest))
Handlebars.registerHelper('compose', wrap(R.compose))
Handlebars.registerHelper('values', wrap(R.values))
Handlebars.registerHelper('prop', wrap(R.prop))
Handlebars.registerHelper('uniq', wrap(R.uniq))
Handlebars.registerHelper('map', wrap(R.map))
Handlebars.registerHelper('replace', wrap(R.replace))
Handlebars.registerHelper('join', wrap(R.join))
Handlebars.registerHelper('add', wrap(R.add))
Handlebars.registerHelper('range', wrap(R.range))
Handlebars.registerHelper('split', wrap(R.split))
Handlebars.registerHelper('includes', wrap(R.includes))
Handlebars.registerHelper('equals', wrap(R.equals))
Handlebars.registerHelper('is', (...args) => {
  const arr = R.dropLast(1, args)
  if (arr[0].toLowerCase() === 'object') arr[0] = Object
  else if (arr[0].toLowerCase() === 'array') arr[0] = Array
  else if (arr[0].toLowerCase() === 'string') arr[0] = String
  else if (arr[0].toLowerCase() === 'number') arr[0] = Number
  else if (arr[0].toLowerCase() === 'boolean') arr[0] = Boolean

  // @ts-ignore
  return R.is(...arr)
})


Handlebars.registerHelper('not', wrap(R.not))
Handlebars.registerHelper('and', (...args) => {
  const arr = R.dropLast(1, args)
  return R.reduce(R.and, true as any, arr) as boolean
})
Handlebars.registerHelper('or', (...args) => {
  const arr = R.dropLast(1, args)
  return R.reduce(R.or, false as any, arr) as boolean
})


Handlebars.registerHelper('stringify', value => JSON.stringify(value, null, 2))


Handlebars.registerHelper('array', (...args) => R.dropLast(1, args))
Handlebars.registerHelper('newline', () => '\n')
export default Handlebars
