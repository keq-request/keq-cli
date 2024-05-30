import { Type, type Static } from '@sinclair/typebox'
import { FileNamingStyle } from './file-naming-style'
import { OperationContext } from './operation-context.js'


export const BuildOptions = Type.Object({
  strict: Type.Optional(Type.Boolean({ default: false })),
  outdir: Type.String({ default: `${process.cwd()}/api` }),
  fileNamingStyle: Type.Optional(Type.Enum(FileNamingStyle, { default: FileNamingStyle.snakeCase })),
  request: Type.Optional(Type.String()),

  operationId: Type.Optional(Type.Function([Type.Any()], Type.String())),

  modules: Type.Record(Type.String(), Type.String()),
})

// eslint-disable-next-line @typescript-eslint/no-redeclare, no-redeclare
export interface BuildOptions extends Omit<Static<typeof BuildOptions>, 'operationId'> {
  operationId?: (context: OperationContext) => string
}
