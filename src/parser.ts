import { OpenAPIV3 } from 'openapi-types'
import * as R from 'ramda'
import { NamingConflictException, UnsupportException } from './exception'
import { NotFoundException } from './exception/not-found-exception'
import * as changeCase from 'change-case'
import {
  Operation,
  OperationResponse,
  OperationParam,
  Schema,
  Model,
  BasicType,
  Options,
  NamingStyle,
} from './interface'


export class Parser {
  private document: OpenAPIV3.Document
  operations: Operation[] = []
  schemas: Schema[] = []
  fileNamingStyle: NamingStyle
  strict: boolean


  constructor(document: OpenAPIV3.Document, options: Required<Options>) {
    this.document = document
    this.strict = options.strict

    this.getRefName = R.memoizeWith(R.prop('$ref'), this.getRefName)
    this.getRef = R.memoizeWith(R.prop('$ref'), this.getRef)

    this.fileNamingStyle = options.fileNamingStyle
  }

  private addOperation(operation: Operation): void {
    if (this.operations.some(R.eqProps('nickname', operation))) {
      throw new NamingConflictException(`Operation naming conflict: ${operation.nickname}.`)
    }

    this.operations.push(operation)
  }

  private addSchema(schema: Schema): void {
    if (this.schemas.some(R.eqProps('classname', schema))) {
      throw new NamingConflictException(`Schema naming conflict: ${schema.classname}.`)
    }

    this.schemas.push(schema)
  }

  private hasRef(ref: OpenAPIV3.ReferenceObject): boolean {
    const refs = ref.$ref.split('/')
    const name = R.last(refs)
    return Boolean(name)
  }

  private getRefName(ref: OpenAPIV3.ReferenceObject): string {
    const refs = ref.$ref.split('/')
    const name = R.last(refs)
    if (!name) throw new NotFoundException(`Cannot find $ref=${ref.$ref} in the swagger document`)


    return name
  }

  private getRef<T extends OpenAPIV3.SchemaObject | OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject | OpenAPIV3.ParameterObject>(ref: OpenAPIV3.ReferenceObject): T {
    if (ref.$ref.startsWith('#')) {
      const refs = ref.$ref.split('/').slice(1)
      const schema = R.path(refs, this.document)
      if (!schema) throw new NotFoundException(`Cannot find $ref=${ref.$ref} in the swagger document`)
      return schema as T
    }
    throw new UnsupportException(`The remote $ref=${ref.$ref} is not support`)
  }


  private createAnyModel(): Model {
    return {
      isAny: true,
      isInt: false,
      isNumber: false,
      isObject: false,
      isArray: false,
      isTuple: false,
      isBoolean: false,

      isBasicDataType: false,
      jsDocDataType: 'any',

      deprecated: false,
      readOnly: false,
      writeOnly: false,

      hasProperties: false,

      isRef: false,
      dependencies: [],

      isIntersectionTypes: false,
      intersectionTypes: [],
      isUnionTypes: false,
      unionTypes: [],

      last: false,
    }
  }

  private createRefModel(ref: OpenAPIV3.ReferenceObject): Model {
    if (!this.hasRef(ref)) return this.createAnyModel()

    return {
      isAny: false,
      isInt: false,
      isNumber: false,
      isObject: false,
      isBoolean: false,
      isArray: false,
      isTuple: false,

      isBasicDataType: false,
      jsDocDataType: this.getRefName(ref),

      deprecated: false,
      readOnly: false,
      writeOnly: false,

      hasProperties: false,

      isRef: true,
      ref: this.getRefName(ref),
      refFilename: changeCase[this.fileNamingStyle](this.getRefName(ref)),
      dependencies: [],

      isIntersectionTypes: false,
      intersectionTypes: [],

      isUnionTypes: false,
      unionTypes: [],

      last: false,
    }
  }


  private calcOperationNickname(pathname: string, method: string): string {
    const nickname = `${method}_${pathname}`
      .replace('/', '_')
      .replace('-', '_')
      .replace(':', '$$')
      .replace(/{(.+)}/, '$$$1')

    return nickname
  }

  private calcBasicType(type: OpenAPIV3.SchemaObject['type']): BasicType {
    switch (type) {
      case 'string': return 'string'
      case 'number': return 'number'
      case 'integer': return 'number'
      case 'boolean': return 'boolean'
    }

    throw new UnsupportException(`The schema type=${type} not support`)
  }

  private calcJsDocType(schemaOrRef: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): string {
    if ('$ref' in schemaOrRef && !this.hasRef(schemaOrRef) && !this.strict) return 'any'
    const schema = '$ref' in schemaOrRef ? this.getRef<OpenAPIV3.SchemaObject>(schemaOrRef) : schemaOrRef

    if (schema.type === 'array' && schema.items) {
      if (typeof schema.items === 'object') {
        return `${this.calcJsDocType(schema.items)}[]`
      } else if (typeof schema.items as never === 'array') {
        const items: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = schema.items as never
        const types = items.map(item => this.calcJsDocType(item)).join(', ')
        return `[${types}]`
      }
    }

    return schema.type || 'any'
  }


  private parseSchema(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined): Model {
    if (!schema) return this.createAnyModel()
    if ('$ref' in schema) return this.createRefModel(schema)

    const isBasicDataType = Boolean(schema.type && ['string', 'integer', 'number', 'boolean'].includes(schema.type))

    const model: Model = {
      ...R.omit(['properties'], schema),
      isAny: false,
      // isString: schema.type === 'string',
      isInt: schema.type === 'integer',
      isNumber: schema.type === 'number',
      isBoolean: schema.type === 'boolean',
      isObject: schema.type === 'object',
      isArray: schema.type === 'array' && typeof schema.items === 'object',
      isTuple: schema.type === 'array' && typeof schema.items as never === 'array',

      isBasicDataType,
      jsDocDataType: this.calcJsDocType(schema),

      deprecated: Boolean(schema.deprecated),
      readOnly: Boolean(schema.readOnly),
      writeOnly: Boolean(schema.writeOnly),

      hasProperties: false,

      isRef: false,
      dependencies: [],

      isIntersectionTypes: false,
      intersectionTypes: [],
      isUnionTypes: false,
      unionTypes: [],

      last: false,
    }

    if (isBasicDataType) model.basicDataType = this.calcBasicType(schema.type)

    if (schema.type === 'object') {
      model.hasProperties = true
      model.properties = []

      for (const key in schema.properties) {
        const submodel = this.parseSchema(schema.properties[key])

        if (submodel.isRef) model.dependencies.push(model)
        model.dependencies.push(...submodel.dependencies)

        model.properties.push({
          key,
          ...submodel,
        })
      }
    }

    if (schema.type === 'array' && schema.items) {
      model.hasProperties = true

      if (typeof schema.items === 'object') {
        model.items = this.parseSchema(schema.items)
        if (model.items.isRef) model.dependencies.push(model.items)
      } else if (typeof schema.items as never === 'array') {
        const items: OpenAPIV3.SchemaObject[] = schema.items as never

        model.tuple = items.map(item => this.parseSchema(item))
        model.dependencies.push(...model.tuple.filter(item => item.isRef))
      }
    }

    if (schema.allOf && schema.allOf.length) {
      model.isIntersectionTypes = true
      model.intersectionTypes = schema.allOf.map(item => this.parseSchema(item))
      model.intersectionTypes[model.intersectionTypes.length - 1].last = true
      model.dependencies.push(...R.unnest(model.intersectionTypes.map(R.prop('dependencies'))))
      model.dependencies.push(...model.intersectionTypes.filter(item => item.isRef))
    }

    if (schema.oneOf && schema.oneOf.length) {
      model.isUnionTypes = true
      model.unionTypes = schema.oneOf.map(item => this.parseSchema(item))
      model.unionTypes[model.unionTypes.length - 1].last = true
      model.dependencies.push(...R.unnest(model.unionTypes.map(R.prop('dependencies'))))
      model.dependencies.push(...model.unionTypes.filter(item => item.isRef))
    }

    model.dependencies = R.uniqWith((a, b) => a.ref === b.ref, model.dependencies)

    return model
  }

  private parseParameter(schemaOrRef: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject): OperationParam {
    const schema = '$ref' in schemaOrRef ? this.getRef<OpenAPIV3.ParameterObject>(schemaOrRef) : schemaOrRef
    return {
      ...schema,
      required: Boolean(schema.required),
      isQuery: schema.in === 'query',
      isHeader: schema.in === 'header',
      isParam: schema.in === 'path',
      isBody: schema.in === 'body',
      model: this.parseSchema(schema.schema),
    }
  }

  private mergeModel(models: Model[]): Model {
    return models[0]
  }

  private parseResponse(code: string, schemaOrRef: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject): OperationResponse {
    const schema = '$ref' in schemaOrRef ? this.getRef<OpenAPIV3.ResponseObject>(schemaOrRef) : schemaOrRef
    const contentModels: Model[] = []

    for (const contentType in schema.content) {
      const result = this.parseSchema(schema.content[contentType].schema)
      contentModels.push(result)
    }

    const response: OperationResponse = {
      code,
      headers: [],
      content: {
        classname: `Response_${code}`,
        model: contentModels.length ? this.mergeModel(contentModels) : this.createAnyModel(),
      },
      dependencies: [],
      last: false,
    }

    response.dependencies.push(...response.content.model.dependencies)
    if (response.content.model.isRef) response.dependencies.push(response.content.model)

    for (const name in schema.headers) {
      const result = this.parseParameter({
        ...schema.headers[name],
        name,
        in: 'header',
      })
      response.headers.push(result)
      if (result.model) response.dependencies.push(...result.model.dependencies)
    }


    return response
  }

  private parseRequestBody(schemaOrRef: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject | undefined): Schema {
    const classname = 'RequestBody'
    if (!schemaOrRef) {
      return {
        classname,
        model: this.createAnyModel(),
      }
    }

    const schema = '$ref' in schemaOrRef ? this.getRef<OpenAPIV3.RequestBodyObject>(schemaOrRef) : schemaOrRef
    const results: Model[] = []
    for (const contentType in schema.content) {
      const result = this.parseSchema(schema.content[contentType].schema)
      results.push(result)
    }

    return {
      classname,
      model: this.mergeModel(results),
    }
  }


  private parseOperation(pathname: string, method: string, schema: OpenAPIV3.OperationObject): Operation {
    const responses: OperationResponse[] = []

    const operation: Operation = {
      ...schema,
      nickname: schema.operationId || this.calcOperationNickname(pathname, method),

      pathname,
      method: method.toLocaleLowerCase(),


      parameters: [],
      request: this.parseRequestBody(schema.requestBody),
      responses,

      dependencies: [],
    }


    const parameters: (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[] = []

    if (schema.parameters) parameters.push(...schema.parameters)

    for (const name of R.match(/(?<={).*?(?=})/g, pathname)) {
      parameters.push({
        schema: { type: 'string' },
        required: true,
        name,
        in: 'path',
      })
    }

    if (schema.requestBody) {
      operation.dependencies.push(...operation.request.model.dependencies)

      const requestBody = '$ref' in schema.requestBody ? this.getRef<OpenAPIV3.RequestBodyObject>(schema.requestBody) : schema.requestBody

      for (const contentType in requestBody.content) {
        const schemaOrRef = requestBody.content[contentType].schema
        if (!schemaOrRef) continue
        const schema = '$ref' in schemaOrRef ? this.getRef<OpenAPIV3.SchemaObject>(schemaOrRef) : schemaOrRef

        if (schema.type === 'object' && schema.properties) {
          for (const key in schema.properties) {
            parameters.push({
              schema: schema.properties[key],
              required: schema.required && schema.required.includes(key),
              name: key,
              in: 'body',
            })
          }
        }
      }
    }

    for (const parameter of parameters) {
      if ('$ref' in parameter && !this.hasRef(parameter) && !this.strict) {
        continue
      }

      const result = this.parseParameter(parameter)
      operation.parameters.push(result)
      if (result.model) operation.dependencies.push(...result.model.dependencies)
    }

    operation.parameters = R.uniqBy(parameter => parameter.name, operation.parameters)

    if (schema.responses) {
      for (const code in schema.responses) {
        const result = this.parseResponse(code, schema.responses[code])
        operation.responses.push(result)
        operation.dependencies.push(...result.dependencies)
      }
      if (operation.responses.length) operation.responses[operation.responses.length - 1].last = true
    }

    operation.dependencies = R.uniqWith((a, b) => a.ref === b.ref, operation.dependencies)
    return operation
  }

  private parseComponent(): void {
    const { document } = this

    if (!document.components) return

    for (const classname in document.components.schemas) {
      const schema = document.components.schemas[classname]
      this.addSchema({
        classname,
        model: this.parseSchema(schema),
      })
    }
  }

  private parseOperations(): void {
    const { document } = this

    for (const pathname in document.paths) {
      const pathObject = document.paths[pathname]

      for (const method in pathObject) {
        const methodObject = pathObject[method]
        this.addOperation(this.parseOperation(pathname, method, methodObject))
      }
    }
  }


  public parse(): void {
    this.parseComponent()
    this.parseOperations()
  }
}
