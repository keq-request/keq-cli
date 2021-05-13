import * as SwaggerParser from '@apidevtools/swagger-parser'
import { Parser } from './parser'
import * as Mustache from 'mustache'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as semver from 'semver'
import * as changeCase from 'change-case'
import { NamingStyle, Options } from './interface/options'
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

  t_schema_component: readTemplate('schema-component'),
  t_operation: readTemplate('operation'),

  t_module: readTemplate('module'),
  t_export: readTemplate('export'),
}


interface File {
  filename: string
  content: string
}


export async function genModuleCode(moduleName: string, json: string | OpenAPIV3.Document, options: Options): Promise<string> {
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

  const fileNamingStyle: NamingStyle = options.fileNamingStyle || 'snakeCase'
  const envName = options.envName || 'KEQ_ENV'
  const view = {
    moduleName,
    services: options.services,
    envName,
  }


  const openapiParser = new Parser(api, {
    ...options,
    fileNamingStyle,
    envName,
  })
  openapiParser.parse()


  const schemaComponentFiles: File[] = []

  for (const schemaComponent of openapiParser.schemas) {
    const content = Mustache.render(templates.t_schema_component, {
      ...schemaComponent,
      ...view,
      exportDefaulted: true,
    }, templates)
    schemaComponentFiles.push({
      filename: changeCase[fileNamingStyle](schemaComponent.classname),
      content,
    })
  }


  const operationFiles: File[] = []
  for (const operation of openapiParser.operations) {
    const content = Mustache.render(templates.t_operation, {
      ...operation,
      ...view,
    }, templates)
    operationFiles.push({
      filename: changeCase[fileNamingStyle](operation.nickname),
      content,
    })
  }

  const moduleFile = {
    content: Mustache.render(templates.t_module, view, templates),
    filename: changeCase[fileNamingStyle]('index') ,
  }


  const output = path.join(options.outdir, changeCase[fileNamingStyle](moduleName))

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


  {
    const filepath = path.join(output, `${moduleFile.filename}.ts`)
    fs.ensureFileSync(filepath)
    fs.writeFileSync(filepath, moduleFile.content)
    return filepath
  }
}


export async function genExportCode(modules: string[], options: Pick<Options, 'outdir' | 'fileNamingStyle'>): Promise<void> {
  const fileNamingStyle: NamingStyle = options.fileNamingStyle || 'snakeCase'

  const content = Mustache.render(templates.t_export, {
    modules: modules.map(m => changeCase[fileNamingStyle](m)),
  }, templates)

  const filepath = path.join(options.outdir, `${changeCase[fileNamingStyle]('index')}.ts`)
  await fs.ensureFile(filepath)
  await fs.writeFile(filepath, content)
}

export async function gencode(moduleName: string, filepath: string, options: Options): Promise<void> {
  await genModuleCode(moduleName, filepath, options)
  await genExportCode([moduleName], { outdir: options.outdir })
}
