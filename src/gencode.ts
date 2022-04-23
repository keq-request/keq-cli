import * as SwaggerParser from '@apidevtools/swagger-parser'
import { Parser } from './parser'
import * as Mustache from 'mustache'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as semver from 'semver'
import * as changeCase from 'change-case'
import { Options } from './interface/options'
import { OpenAPIV3 } from 'openapi-types'
import * as chalk from 'chalk'


function readTemplate(filename: string, fold = false): string {
  let content = fs.readFileSync(path.join(__dirname, `./templates/${filename}.mustache`), 'utf-8')
  content = content.trim()
  if (fold) return content.replace(/\n/g, '')
  return content
}

const templates = {
  t_properties: readTemplate('properties'),

  t_model_array: readTemplate('model-array'),
  t_model_object: readTemplate('model-object'),
  t_model_tuple: readTemplate('model-tuple'),
  t_model_intersection_types: readTemplate('model-intersection-types'),
  t_model_union_types: readTemplate('model-union-types'),
  t_model: readTemplate('model', true),
  t_schema: readTemplate('schema'),

  t_schema_component: readTemplate('schema-component'),
  t_operation: readTemplate('operation'),

  t_module: readTemplate('module'),
}


interface File {
  filename: string
  content: string
  exports: string[]
}


async function genModuleCode(moduleName: string, json: string | OpenAPIV3.Document, options: Required<Options>): Promise<void> {
  const { fileNamingStyle } = options
  const swaggerParser = new SwaggerParser()
  let api: OpenAPIV3.Document
  try {
    await swaggerParser.bundle(json)

    if (!('openapi' in swaggerParser.api && semver.satisfies(swaggerParser.api.openapi, '^3'))) throw new Error('Only supports OpenAPI3')
    api = swaggerParser.api
  } catch (e) {
    console.warn(chalk.yellow('Swagger file does not conform to the swagger@3.0 standard specifications or have grammatical errors, which may cause unexpected errors'))
    api = json as any
  }

  const view = {
    moduleName,
    defineEnv: Boolean(Object.values(options.env).length),
    env: JSON.stringify(options.env, null, 2),
    envName: options.envName,
  }


  const openapiParser = new Parser(api, options)
  openapiParser.parse()


  const schemaComponentFiles: File[] = []

  for (const schemaComponent of openapiParser.schemas) {
    const content = Mustache.render(templates.t_schema_component, {
      ...schemaComponent,
      ...view,
      exportDefaulted: false,
    }, templates)
    schemaComponentFiles.push({
      filename: changeCase[fileNamingStyle](schemaComponent.classname),
      exports: [schemaComponent.classname],
      content,
    })
  }

  const output = path.join(options.outdir, changeCase[fileNamingStyle](moduleName))

  const operationFiles: File[] = []
  for (const operation of openapiParser.operations) {
    const operationView = {
      ...operation,
      ...view,
      request: options.request.includes('/') ? path.relative(output, options.request) : options.request,
    }
    const content = Mustache.render(templates.t_operation, operationView, templates)
    operationFiles.push({
      filename: changeCase[fileNamingStyle](operation.nickname),
      exports: [operation.nickname],
      content,
    })
  }


  await Promise.all(schemaComponentFiles.map(async file => {
    const filepath = path.join(output, 'components', 'schema', `${file.filename}.ts`)
    await fs.ensureFile(filepath)
    await fs.writeFile(filepath, file.content)
  }))

  await Promise.all(operationFiles.map(async file => {
    const filepath = path.join(output, `${file.filename}.ts`)
    await fs.ensureFile(filepath)
    await fs.writeFile(filepath, file.content)
  }))


  if (schemaComponentFiles.length) {
    const moduleView = {
      ...view,
      files: schemaComponentFiles,
    }
    const moduleFile = {
      content: Mustache.render(templates.t_module, moduleView, templates),
      filename: changeCase[fileNamingStyle]('index') ,
    }

    const filepath = path.join(output, 'components', 'schema', `${moduleFile.filename}.ts`)
    fs.ensureFileSync(filepath)
    fs.writeFileSync(filepath, moduleFile.content)
  }

  {
    const moduleView = {
      ...view,
      files: operationFiles,
    }

    const moduleFile = {
      content: Mustache.render(templates.t_module, moduleView, templates),
      filename: changeCase[fileNamingStyle]('index') ,
    }

    const filepath = path.join(output, `${moduleFile.filename}.ts`)
    fs.ensureFileSync(filepath)
    fs.writeFileSync(filepath, moduleFile.content)
  }
}


export async function gencode(moduleName: string, filepath: string, options: Options): Promise<void> {
  await genModuleCode(moduleName, filepath, {
    ...options,
    strict: options.strict || true,
    fileNamingStyle: options.fileNamingStyle || 'snakeCase',
    envName: options.envName || 'KEQ_ENV',
    env: options.env || {},
  })
}
