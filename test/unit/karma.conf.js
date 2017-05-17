// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

var path = require('path')
var baseConfig = {
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ],
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                plugins: [['istanbul']]
            }
        ]
    },
    plugins: [],
    devtool: '#inline-source-map'
}
var webpack = require('webpack')
var projectRoot = path.resolve(__dirname, '../../')
var utils = require('./utils')

module.exports = function (config) {
    config.set({
        // to run in additional browsers:
        // 1. install corresponding karma launcher
        //    http://karma-runner.github.io/0.13/config/browsers.html
        // 2. add it to the `browsers` array below.
        browsers: ['PhantomJS'],
        frameworks: ['mocha'],//, 'sinon-chai'
        reporters: ['spec', 'coverage'],
        files: ['./index.js'],
        preprocessors: {
            './index.js': ['webpack', 'sourcemap']
        },
        webpack: baseConfig,
        webpackMiddleware: {
            noInfo: true
        },
        coverageReporter: {
            dir: './coverage',
            reporters: [
                { type: 'lcov', subdir: '.' },
                { type: 'text-summary' }
            ]
        },
        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom) 
            exitOnResourceError: true
        },
        plugins: [
            'karma-mocha',
            'karma-coverage',
            'karma-spec-reporter',
            'karma-phantomjs-launcher',
            'karma-webpack',
            'karma-sourcemap-loader',
            'webpack'
            // 'karma-sinon-chai'
        ]
    })
}
