<!-- title -->
<p align="center" style="padding-top: 41px">
  <img src="./images/logo.svg?sanitize=true" width="121" alt="logo" />
</p>

<h2 align="center" style="text-align: center">KEQ-CLI</h2>
<!-- title -->

[npm]: https://www.npmjs.com/package/keq-cli

[![version](https://img.shields.io/npm/v/keq-cli.svg?logo=npm&style=for-the-badge)][npm]
[![downloads](https://img.shields.io/npm/dm/keq-cli.svg?logo=npm&style=for-the-badge)][npm]
[![dependencies](https://img.shields.io/librariesio/release/npm/keq-cli?logo=npm&style=for-the-badge)][npm]
[![license](https://img.shields.io/npm/l/keq-cli.svg?logo=github&style=for-the-badge)][npm]
[![Codecov](https://img.shields.io/codecov/c/gh/keq-request/keq-cli?logo=codecov&token=PLF0DT6869&style=for-the-badge)](https://codecov.io/gh/keq-request/keq-cli)


<!-- description -->
[简体中文](./doc/zh-cn/README.md)

Transform Swagger 3.0 to the function that send request by [keq](https://github.com/keq-request/keq).
<!-- description -->

## Usage

<!-- usage -->

### Prepare

You need prepare a [Swagger 3.0 file](./tests/swagger.json) first.

### Compile


```bash
npx keq-cli compile  -o ./output -m userService ./swagger.json
```

Options:

 option                | description
:----------------------|:------------------------
 `-o --outdir`         | The output directory
 `-m --module-name`    | The module name
 `--file-naming-style` | File naming style.(default 'snakeCase', see more in [change-case](https://www.npmjs.com/package/change-case))
 `--request`           | The request package used in compiled result.(default 'keq')


### Use In Coding

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
## Configuration file


Use configuration files is easy to regeneration.
By default, `keq-cli` will search for `.keqrc.yml`, `.keqrc.json`, `keqrc.js.config`.
You can use `-c --config <config_file_path>` to set the config file you wanted.

```bash
npx keq-cli build
npx keq-cli build -c ./.keqrc.yml
```

Compared with `keq-cli compile`, the configuration file can set multiple modules with multiple url for different environments.

The yml configuration file Example:

```yml
outdir: ./output
fileNamingStyle: snakeCase
modules:
  userService: ./swagger.json
  coreService: http://example.com/swagger.json
```

The json configuration file Example:

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
