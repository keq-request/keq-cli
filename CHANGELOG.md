# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.1](https://www.github.com/keq-request/keq-cli/compare/v2.1.0...v2.1.1) (2022-03-01)


### Bug Fixes

* not render array items, if reponse is an array ([6912b44](https://www.github.com/keq-request/keq-cli/commit/6912b4424b40585202c6a2778ed0a6a22223c214))

## [2.1.0](https://www.github.com/keq-request/keq-cli/compare/v2.0.2...v2.1.0) (2022-02-25)


### Features

* it is no longer necessary to fill in the parameter, if no parameters ([05c0f44](https://www.github.com/keq-request/keq-cli/commit/05c0f44553aadf10e8d09f7a235689826891dbf7))


### Bug Fixes

* generate error when response body is an array ([a4cdfc0](https://www.github.com/keq-request/keq-cli/commit/a4cdfc07c14121bfe443ad7eb0d247961d27fcfe))

### [2.0.2](https://www.github.com/keq-request/keq-cli/compare/v2.0.1...v2.0.2) (2022-01-17)


### Bug Fixes

* component schmea not find in schema file ([1b4711c](https://www.github.com/keq-request/keq-cli/commit/1b4711cb7201199da87ffdf39581d86878767eb8))

### [2.0.1](https://www.github.com/keq-request/keq-cli/compare/v2.0.0...v2.0.1) (2022-01-17)


### Bug Fixes

* component schmea not find in operation ([6084457](https://www.github.com/keq-request/keq-cli/commit/6084457e921be01ad8fe3bdc14e3d231a1f21fdc))

## [2.0.0](https://www.github.com/keq-request/keq-cli/compare/v1.2.2...v2.0.0) (2022-01-17)


### ⚠ BREAKING CHANGES

* Never export operation/schema as default; No longer support keq-proxy<1.2, keq<1.7.

### Features

* change the import method and auto export all module operations ([1cc5038](https://www.github.com/keq-request/keq-cli/commit/1cc50380f2fb80c7948442134db7d399585ee761))


### Bug Fixes

* import the self file ([4110d1d](https://www.github.com/keq-request/keq-cli/commit/4110d1d76bf34c5e9fe191561efb792dafa50c37))
* incorrect file path import ([53fadc7](https://www.github.com/keq-request/keq-cli/commit/53fadc787f572da3cd9e3c2a131c6908f1df5801))
* multiline comments do not handle line break ([c6e407a](https://www.github.com/keq-request/keq-cli/commit/c6e407a214cd909970ed64cb424d7263b92d971c))

### [1.2.2](https://www.github.com/keq-request/keq-cli/compare/v1.2.1...v1.2.2) (2021-05-14)


### Bug Fixes

* unused env variable in module template ([7d3b567](https://www.github.com/keq-request/keq-cli/commit/7d3b56703adf7e7d2c3fb1e6edce926698d4c910))

### [1.2.1](https://www.github.com/keq-request/keq-cli/compare/v1.2.0...v1.2.1) (2021-05-13)


### Bug Fixes

* url is optional field but throw error when it is not set ([14140a2](https://www.github.com/keq-request/keq-cli/commit/14140a2b9d754d36510c6cef1ffd1c7de0f2ca2b))

## [1.2.0](https://www.github.com/keq-request/keq-cli/compare/v1.1.3...v1.2.0) (2021-05-13)


### Features

* add strict mode ([1f0391d](https://www.github.com/keq-request/keq-cli/commit/1f0391dc2ec4f1890339bb951d19cebe9400b9b3))
* beautify stderr ([7782e38](https://www.github.com/keq-request/keq-cli/commit/7782e381b91f00465f5952d627e18ff3e44bf042))


### Bug Fixes

* `$ref` is not imported ([6a202b2](https://www.github.com/keq-request/keq-cli/commit/6a202b2f41dbf491acee9195dc95e7ec3e1048c8))
* not throw error when config invalid ([83abe3b](https://www.github.com/keq-request/keq-cli/commit/83abe3b9d045ff27a532cc48a6335afcaf6b165e))
* unknown keyword "require" in ajv@8 ([aba034c](https://www.github.com/keq-request/keq-cli/commit/aba034c8a7d2daa9abd7214e41e3baaecef32d91))

### [1.1.3](https://www.github.com/keq-request/keq-cli/compare/v1.1.2...v1.1.3) (2021-05-12)


### Bug Fixes

* unable build ([0f56acf](https://www.github.com/keq-request/keq-cli/commit/0f56acff7f2bec334395d8a81d89bd210d9507ef))

### [1.1.2](https://www.github.com/keq-request/keq-cli/compare/v1.1.1...v1.1.2) (2021-05-12)


### Bug Fixes

* cannot find ajv ([0e4fd9c](https://www.github.com/keq-request/keq-cli/commit/0e4fd9cdae9f74d996effb423aac33c370458f37))

### [1.1.1](https://www.github.com/keq-request/keq-cli/compare/v1.1.0...v1.1.1) (2021-05-12)


### Bug Fixes

* keq should be dependencies ([b862714](https://www.github.com/keq-request/keq-cli/commit/b8627141afa95703614392cb53afde715942fbaa))
* valid-url is undefined ([bdacad6](https://www.github.com/keq-request/keq-cli/commit/bdacad6f952701e08217a1d2a0ea5631b5f865a4))

## [1.1.0](https://www.github.com/keq-request/keq-cli/compare/v1.0.3...v1.1.0) (2021-05-11)


### Features

* can get swagger file from url ([3f64462](https://www.github.com/keq-request/keq-cli/commit/3f64462c0dc2ed2c845c812d6a32e32135e1836b)), closes [#4](https://www.github.com/keq-request/keq-cli/issues/4)

### [1.0.3](https://www.github.com/keq-request/keq-cli/compare/v1.0.2...v1.0.3) (2021-05-11)


### Bug Fixes

* cannot find ramda ([4270dca](https://www.github.com/keq-request/keq-cli/commit/4270dca65d5a5ce2c8cc08368692199dc9f13227))

### [1.0.2](https://www.github.com/keq-request/keq-cli/compare/v1.0.1...v1.0.2) (2021-05-11)


### Bug Fixes

* cannot find fs-extra ([d68d049](https://www.github.com/keq-request/keq-cli/commit/d68d049a34e09c622bed6da72283f373e62ab41b))

### [1.0.1](https://www.github.com/keq-request/keq-cli/compare/v1.0.0...v1.0.1) (2021-05-11)


### Bug Fixes

* the file path of bin cannot run ([c6c9cf3](https://www.github.com/keq-request/keq-cli/commit/c6c9cf301e6a5bf1b39e02399da39749454ebfa0))

## 1.0.0 (2021-05-06)
