export type NamingStyle = 'camelCase' | 'capitalCase' | 'constantCase' | 'dotCase' | 'headerCase' | 'noCase' | 'paramCase' | 'pascalCase' | 'pathCase' | 'sentenceCase' | 'snakeCase'

export interface Options {
  outdir: string
  /**
   * @default 'KEQ_ENV'
   */
  envName?: string
  strict: boolean
  fileNamingStyle?: NamingStyle
  plugins: string[]
  services: {
    env: string
    url: string
  }[]
}
