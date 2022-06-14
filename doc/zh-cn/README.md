<!-- title -->
<p align="center" style="padding-top: 41px">
  <img src="../../images/logo.svg?sanitize=true" width="121" alt="logo" />
</p>

<h2 align="center" style="text-align: center">KEQ-CLI</h1>
<!-- title -->

[![version](https://img.shields.io/npm/v/keq-cli.svg?style=flat-square)](https://www.npmjs.com/package/keq-cli)
[![downloads](https://img.shields.io/npm/dm/keq-cli.svg?style=flat-square)](https://www.npmjs.com/package/keq-cli)
[![license](https://img.shields.io/npm/l/keq-cli.svg?style=flat-square)](https://www.npmjs.com/package/keq-cli)
[![dependencies](https://img.shields.io/david/keq-request/keq-cli.svg?style=flat-square)](https://www.npmjs.com/package/keq-cli)
[![coveralls](https://img.shields.io/coveralls/github/keq-request/keq-cli.svg?style=flat-square)](https://coveralls.io/github/keq-request/keq-cli)



<!-- description -->
将Swagger 3.0接口文档转换成可以在代码中直接使用的函数。通过[keq](https://github.com/keq-request/keq)封装请求并具备完整的代码提示功能。
<!-- description -->

## Usage

<!-- usage -->

### 准备

你需要先准备一份[Swagger 3.0的接口文档文件](../../tests/swagger.json)。

### 编译


```bash
npx keq-cli compile  -o ./output -m userService ./swagger.json
```


命令行选项：

 option                | description
:----------------------|:------------------------
 `-o --outdir`         | 输出目录
 `-m --module-name`    | 模块名
 `--file-naming-style` | 文件命名风格（默认：snakeCase，更多选项请查看[change-case](https://www.npmjs.com/package/change-case)
 `--request`           | 在编译结果中使用的请求实例（默认使用keq的全局request）

### 在编码中使用

```typescript
import { request, mount } from 'keq'
import { setHeader } from 'keq-header'
import proxy from 'keq-proxy'
import updateUser from './outdir/userService/update_user'


request
  // set your middleware for module
  .use(mount.module('userService'), setHeader('x-custom-header', 'custom_value'))
  // set modlue request url
  .use(proxy.module('userService', 'http://example.com/api'))



async function action() {
  await updateUser({ id: 1, name: 'Marry' })
}
```
<!-- usage -->

<!-- addition -->
## 配置文件


使用配置文件能方便重新生成代码。
默认情况下`keq-cli`会搜索命名为`.keqrc.yml`, `.keqrc.json`或`keqrc.js.config`的文件。
你也可以通过`-c --config <config_file_path>`手动指定配置文件。

```bash
npx keq-cli build
npx keq-cli build -c ./.keqrc.yml
```

相比`keq-cli compile`，配置文件可以一次设置多个模块，并为每个模块指定多个环境名称和请求地址。
生成的代码会优先查找`KEQ_ENV`来匹配对应环境的请求地址，如果未设置`KEQ_ENV`，则使用`NODE_ENV`。
若`process.env.KEQ_ENV || process.env.NODE_ENV`无法匹配到任意环境设置，那么将会请求`/`地址。


YML格式的配置文件：

```yml
outdir: ./output
fileNamingStyle: snakeCase
modules:
  userService: ./swagger.json
  coreService: http://example.com/swagger.json
```

JSON 格式的配置文件：

```json
{
  "outdir": "./output",
  "fileNamingStyle": "snakeCase",
  "modules": {
    "userService": "./swagger.json",
    "coreService": "http://example.com/swagger.json"
  }
}
```
<!-- addition -->

## Sponsor

Support code development on patron.

[![patron](https://c5.patreon.com/external/logo/become_a_patron_button@2x.png)](https://www.patreon.com/bePatron?u=22478507)

## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.
Please read [Contributor Covenant Code of Conduct](.github/CODE_OF_CONDUCT.md) and [CONTRIBUTING](.github/CONTRIBUTING.md).
