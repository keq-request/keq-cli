# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.0.11](https://www.github.com/keq-request/keq-cli/compare/v3.0.10...v3.0.11) (2022-07-23)


### Bug Fixes

* the wrong custom request instance path in generated file ([d92d2d9](https://www.github.com/keq-request/keq-cli/commit/d92d2d94fe3413c3a96fe09fdd88862e539da077))

### [3.0.10](https://www.github.com/keq-request/keq-cli/compare/v3.0.9...v3.0.10) (2022-06-19)


### Bug Fixes

* url template not transformed in module pathname ([4dcc092](https://www.github.com/keq-request/keq-cli/commit/4dcc092b120111cc19b1f710350feb3f69ef71a0))

### [3.0.9](https://www.github.com/keq-request/keq-cli/compare/v3.0.8...v3.0.9) (2022-06-19)


### Bug Fixes

* url template is not transformed automatically ([d7257cc](https://www.github.com/keq-request/keq-cli/commit/d7257ccc4e0cac758d34a8503b7e99b35cbf7325))

### [3.0.8](https://www.github.com/keq-request/keq-cli/compare/v3.0.7...v3.0.8) (2022-06-19)


### Bug Fixes

* the request body is not autofilled ([35e48e7](https://www.github.com/keq-request/keq-cli/commit/35e48e7e7496e723b1b2480698476110db7333b0))

### [3.0.7](https://www.github.com/keq-request/keq-cli/compare/v3.0.6...v3.0.7) (2022-06-16)


### Bug Fixes

* export unnecessary type declarations ([5d36b87](https://www.github.com/keq-request/keq-cli/commit/5d36b87e68e5c281a8fbd04ddc1f3eda6d3edb0c))
* schema dependencies are deduplicated ([7a6df88](https://www.github.com/keq-request/keq-cli/commit/7a6df88d0f741af3a18ad6672aef235c5822ab35))

### [3.0.6](https://www.github.com/keq-request/keq-cli/compare/v3.0.5...v3.0.6) (2022-06-15)


### Bug Fixes

* missing export file ([e8d9ef0](https://www.github.com/keq-request/keq-cli/commit/e8d9ef0861a357a85e95a98f49addd3f9200ab64))

### [3.0.5](https://www.github.com/keq-request/keq-cli/compare/v3.0.4...v3.0.5) (2022-06-15)


### Bug Fixes

* error generated by recursive interface ([c23318f](https://www.github.com/keq-request/keq-cli/commit/c23318fe059765f8402a174ebe531a7aaec1568a))
* missing return type of operation ([43b0e81](https://www.github.com/keq-request/keq-cli/commit/43b0e81f40088d67db0e25cf1778545e9df9a118))
* query args compatible in operation ([084884f](https://www.github.com/keq-request/keq-cli/commit/084884f7035cde7869caa93d99d5ed592d583e20))
* return type declaration error when multiple return values ([516284a](https://www.github.com/keq-request/keq-cli/commit/516284a388f27b3a3fdd9cd4a3a9a77747e4373e))


### Performance Improvements

* reduce file write times ([1f28a75](https://www.github.com/keq-request/keq-cli/commit/1f28a75d133e995bd271ee8e7cb5303db47a1ace))

### [3.0.4](https://www.github.com/keq-request/keq-cli/compare/v3.0.3...v3.0.4) (2022-06-14)


### Bug Fixes

* cannot find hbs files ([3c1210b](https://www.github.com/keq-request/keq-cli/commit/3c1210bdd87d9d8da3298d9537394cd7a524835c))

### [3.0.3](https://www.github.com/keq-request/keq-cli/compare/v3.0.2...v3.0.3) (2022-06-14)


### Bug Fixes

* missing dependencies: @apidevtools/swagger-parser ([a195cf9](https://www.github.com/keq-request/keq-cli/commit/a195cf9a46e8bc99424ef7b8f5c4893d3d99222c))

### [3.0.2](https://www.github.com/keq-request/keq-cli/compare/v3.0.1...v3.0.2) (2022-06-14)


### Bug Fixes

* remove husky from postinstall ([6f730f4](https://www.github.com/keq-request/keq-cli/commit/6f730f41edb54bfb22a8e3b48c9d54c187236331))

### [3.0.1](https://www.github.com/keq-request/keq-cli/compare/v3.0.0...v3.0.1) (2022-06-14)


### Bug Fixes

* cannot find command ([d597bdb](https://www.github.com/keq-request/keq-cli/commit/d597bdbbd74a7be89a23b70150a5204df4dcff1b))

## [3.0.0](https://www.github.com/keq-request/keq-cli/compare/v2.5.0...v3.0.0) (2022-06-14)


### ??? BREAKING CHANGES

* never support env setting

### Code Refactoring

* replace mustache with handlebars ([a1b381b](https://www.github.com/keq-request/keq-cli/commit/a1b381b454546197cab9e3fad9333ce7b30769d7))

## [2.5.0](https://www.github.com/keq-request/keq-cli/compare/v2.4.0...v2.5.0) (2022-05-10)


### Features

* support nullable ([62cf7f6](https://www.github.com/keq-request/keq-cli/commit/62cf7f667638bcb149c57b804c63cdf5a7469602))

## [2.4.0](https://www.github.com/keq-request/keq-cli/compare/v2.3.3...v2.4.0) (2022-04-23)


### Features

* remove unnecessary env definition ([384fee7](https://www.github.com/keq-request/keq-cli/commit/384fee7fc4a900ac79e5b337b01e3f0d8998d4be))

### [2.3.3](https://www.github.com/keq-request/keq-cli/compare/v2.3.2...v2.3.3) (2022-04-15)


### Bug Fixes

* additional properties generate wrong ts interface ([a6bf3a8](https://www.github.com/keq-request/keq-cli/commit/a6bf3a88e55b45a6bab8d5e5205cea48d6fc3e2a))

### [2.3.2](https://www.github.com/keq-request/keq-cli/compare/v2.3.1...v2.3.2) (2022-04-13)


### Bug Fixes

* the type error in compile result ([b044ec5](https://www.github.com/keq-request/keq-cli/commit/b044ec506f4aac48dcdb51a8d143d27821d9babe))

### [2.3.1](https://www.github.com/keq-request/keq-cli/compare/v2.3.0...v2.3.1) (2022-04-13)


### Bug Fixes

* envName option not work ([727c030](https://www.github.com/keq-request/keq-cli/commit/727c0303f318adf50106fab563f867f2e207ce15))

## [2.3.0](https://www.github.com/keq-request/keq-cli/compare/v2.2.0...v2.3.0) (2022-04-13)


### Features

* enable change the request instance and set environment vairable ([3c2cf96](https://www.github.com/keq-request/keq-cli/commit/3c2cf960231865b15dcc5947061366a06beb5ffc))

## [2.2.0](https://www.github.com/keq-request/keq-cli/compare/v2.1.2...v2.2.0) (2022-04-11)


### Features

* auto transform url template ([106e585](https://www.github.com/keq-request/keq-cli/commit/106e585f7c9e480a541bd2350b51836a6a31b3f9))

### [2.1.2](https://www.github.com/keq-request/keq-cli/compare/v2.1.1...v2.1.2) (2022-03-21)


### Bug Fixes

* the return type of operation is a Keq<T> rather than Promise ([30f4db4](https://www.github.com/keq-request/keq-cli/commit/30f4db4e5e12636f8ea2b489314493ff433ef97f))

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


### ??? BREAKING CHANGES

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
