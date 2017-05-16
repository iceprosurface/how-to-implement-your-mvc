// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

var path = require('path')
var baseConfig = require('../../config/webpack.config.js')
var merge = require('webpack-merge')
var webpack = require('webpack')
var projectRoot = path.resolve(__dirname, '../../')
var utils = require('./utils')
var webpackConfig = merge(baseConfig, {
    // use inline sourcemap for karma-sourcemap-loader
    module: {
        loaders: utils.styleLoaders()
    },
    devtool: '#inline-source-map',
    vue: {
        loaders: {
            js: 'isparta'
        }
    },
    plugins: [
    ]
})

// no need for app entry during tests
delete webpackConfig.entry

// make sure isparta loader is applied before eslint
webpackConfig.module.preLoaders = webpackConfig.module.preLoaders || []
webpackConfig.module.preLoaders.unshift({
    test: /\.js$/,
    loader: 'isparta',
    include: path.resolve(projectRoot, 'src')
})

// only apply babel for test files when using isparta
webpackConfig.module.loaders.some(function (loader, i) {
    if (loader.loader === 'babel') {
        loader.include = path.resolve(projectRoot, 'test/unit')
        return true
    }
})

module.exports = function (config) {
    config.set({
        // to run in additional browsers:
        // 1. install corresponding karma launcher
        //    http://karma-runner.github.io/0.13/config/browsers.html
        // 2. add it to the `browsers` array below.
        browsers: ['Chrome'],
        frameworks: ['mocha'],//, 'sinon-chai'
        reporters: ['spec', 'coverage'],
        files: ['./index.js'],
        preprocessors: {
            './index.js': ['webpack', 'sourcemap']
        },
        webpack: webpackConfig,
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
        plugins: [
            'karma-mocha',
            'karma-coverage',
            'karma-spec-reporter',
            'karma-chrome-launcher',
            'karma-webpack',
            'karma-sourcemap-loader',
            'webpack'
            // 'karma-sinon-chai'
        ]
    })
}