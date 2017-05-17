// Polyfill fn.bind() for PhantomJS
/* eslint-disable no-extend-native */
// Function.prototype.bind = require('function-bind')

// require all test files (files that ends with .spec.js)
var testsContext = require.context('./specs', true, /\.spec$/)
testsContext.keys().forEach(testsContext)

var srcContext = require.context('../../src', true, /^\.\/(?!main(\.js)?$)/)
srcContext.keys().forEach(srcContext)

