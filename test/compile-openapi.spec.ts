import { afterEach, expect, test } from '@jest/globals'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import { OpenAPIV3 } from 'openapi-types'
import { CompileOpenapi } from '~/compile-openapi'
import { FileNamingStyle } from '~/types/file-naming-style'


const tempDirs: string[] = []

async function createOutdir(): Promise<string> {
  const outdir = await fs.mkdtemp(path.join(os.tmpdir(), 'keq-cli-'))
  tempDirs.push(outdir)
  return outdir
}

function createDocument(overrides: Partial<OpenAPIV3.Document> = {}): OpenAPIV3.Document {
  return {
    openapi: '3.0.0',
    info: {
      title: 'test',
      version: '0.0.1',
    },
    paths: {},
    ...overrides,
  }
}

async function compileDocument(document: OpenAPIV3.Document): Promise<string> {
  const outdir = await createOutdir()
  await CompileOpenapi({
    moduleName: 'test',
    document,
    outdir,
    fileNamingStyle: FileNamingStyle.snakeCase,
    strict: false,
  })
  return path.join(outdir, 'test')
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)))
})


test('generate empty schemas index when all schemas are inline', async () => {
  const output = await compileDocument(createDocument({
    paths: {
      '/api/test': {
        post: {
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {},
    },
  }))

  const schemasIndex = await fs.readFile(path.join(output, 'components', 'schemas', 'index.ts'), 'utf-8')
  const rootIndex = await fs.readFile(path.join(output, 'index.ts'), 'utf-8')

  expect(schemasIndex).toBe('export {}\n')
  expect(rootIndex).toContain('export * from "./post_api_test"')
})

test('generate empty index files when the document has no paths and schemas', async () => {
  const output = await compileDocument(createDocument())

  const schemasIndex = await fs.readFile(path.join(output, 'components', 'schemas', 'index.ts'), 'utf-8')
  const rootIndex = await fs.readFile(path.join(output, 'index.ts'), 'utf-8')

  expect(schemasIndex).toBe('export {}\n')
  expect(rootIndex).toBe('export {}\n')
})

test('generate schemas index that re-exports schema files', async () => {
  const output = await compileDocument(createDocument({
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    },
  }))

  const schemasIndex = await fs.readFile(path.join(output, 'components', 'schemas', 'index.ts'), 'utf-8')

  expect(schemasIndex).toBe('export * from "./user"')
})
