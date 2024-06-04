import { Type, type Static } from '@sinclair/typebox'
import { BuildOptions } from './build-options.js'


export const CompileOptions = Type.Intersect([
  Type.Pick(BuildOptions, ['strict', 'esm', 'outdir', 'fileNamingStyle', 'request', 'operationId']),
  Type.Object({
    moduleName: Type.String(),
    filepath: Type.String(),
  }),
])

// eslint-disable-next-line @typescript-eslint/no-redeclare, no-redeclare
export type CompileOptions = Static<typeof CompileOptions>
