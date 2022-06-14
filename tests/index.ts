import test from 'ava'
import * as swagger from './swagger.json'
import { compile } from '@/gen-code'
import { OpenAPIV3 } from 'openapi-types'


test('compile swagger', async t => {
  const files = await compile('test', swagger as unknown as OpenAPIV3.Document, {
    outdir: './outdir',
  })

  t.snapshot(files)
})
