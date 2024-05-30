import { CompileOpenapiOptions } from './types/compile-openapi-options.js'
import { CompileOpenapi } from './compile-openapi.js'
import { CompileOptions } from './types/compile-options.js'
import { fetchOpenapiFile } from './utils/fetch-openapi-file.js'
import { FileNamingStyle } from './types/file-naming-style.js'


export async function compile(options: CompileOptions): Promise<void> {
  const document = await fetchOpenapiFile(options.filepath)

  const compileOpenapiOptions: CompileOpenapiOptions = {
    outdir: options.outdir,
    strict: options.strict,
    request: options.request,
    fileNamingStyle: options.fileNamingStyle || FileNamingStyle.snakeCase,
    moduleName: options.moduleName,
    operationId: options.operationId,
    document,
  }

  await CompileOpenapi(compileOpenapiOptions)
}
