import { Options } from '@/interface'
import * as chokidar from 'chokidar'
import { compile } from '@/compile'
import * as ora from 'ora'

export const watch = async(filepath: string, options: Options & { moduleName: string }): Promise<void> => {
  console.log(filepath, JSON.stringify(options))
  chokidar.watch(filepath)
    .on('change', async path => {
      const spinner = ora({
        spinner: {
          interval: 120,
          frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸'],
        },
        text: `正在为 ${path} 重新生成`,
      })
      spinner.start()
      const filepath = await compile(options.moduleName, path, options)
      spinner.succeed()
      console.log(`${filepath} 已更新`)
    })
}
