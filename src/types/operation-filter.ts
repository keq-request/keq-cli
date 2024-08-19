/* eslint-disable @typescript-eslint/no-redeclare */
import { Type, type Static } from '@sinclair/typebox'


export const OperationFilter = Type.Object({
  // whether to generate files that do not exist
  append: Type.Optional(Type.Boolean({ default: false })),
  // whether to update files that already exist
  update: Type.Optional(Type.Boolean({ default: false })),

  // Only generate files of the specified operation method
  operationMethod: Type.Optional(Type.String()),
  // Only generate files of the specified operation pathname
  operationPathname: Type.Optional(Type.String()),
})


export type OperationFilter = Static<typeof OperationFilter>
