# aurelia-loader

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains an abstract module which specifies an interface for loading modules and view templates.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/). If you have questions, we invite you to join us on [our Gitter Channel](https://gitter.im/aurelia/discuss).

## Polyfills

* Depending on target browser(s), [core-js](https://github.com/zloirock/core-js) is likely required for `Promise` support.

* If targeting IE, [aurelia-html-template-element](https://github.com/aurelia/html-template-element) is required.

* If not targeting Chrome, the HTMLImports polyfill from [webcomponentsjs](https://github.com/webcomponents/webcomponentsjs) is required. Note that you may also substitue with the entire `webcomponents-lite.js` or `webcomponents.js` polyfills. On top of this you may also add `polymer.html` if using polymer elements is required for your scenario.

## Dependencies

This library has **NO** external dependencies other than the above Polyfills.

## Used By

* [aurelia-framework](https://github.com/aurelia/framework)
* [aurelia-loader-systemjs](https://github.com/aurelia/loader-systemjs)
* [aurelia-templating](https://github.com/aurelia/templating)

## Platform Support

This library can be used in the **browser** only.

## Building The Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
3. Ensure that [Gulp](http://gulpjs.com/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g gulp
  ```
4. To build the code, you can now run:

  ```shell
  gulp build
  ```
5. You will find the compiled code in the `dist` folder, available in three module formats: AMD, CommonJS and ES6.

6. See `gulpfile.js` for other tasks related to generating the docs and linting.

## Running The Tests

To run the unit tests, first ensure that you have followed the steps above in order to install all dependencies and successfully build the library. Once you have done that, proceed with these additional steps:

1. Ensure that the [Karma](http://karma-runner.github.io/) CLI is installed. If you need to install it, use the following command:

  ```shell
  npm install -g karma-cli
  ```
2. Ensure that [jspm](http://jspm.io/) is installed. If you need to install it, use the following commnand:

  ```shell
  npm install -g jspm
  ```
3. Install the client-side dependencies with jspm:

  ```shell
  jspm install
  ```

4. You can now run the tests with this command:

  ```shell
  karma start
  ```
