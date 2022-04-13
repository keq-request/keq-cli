import test from 'ava'
import { Parser } from '../src/parser'
import * as swagger from './swagger.json'


test('Parser', async t => {
  const parser = new Parser(swagger as any, {
    outdir: './output',
    strict: true,
    envName: 'KEQ_ENV',
    request: 'keq',
    fileNamingStyle: 'snakeCase',
    env: {},
  })

  parser.parse()

  t.snapshot(parser.operations, 'opeartions expected')
  t.snapshot(parser.schemas, 'schemas expected')
})
