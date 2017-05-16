//一个常见的Webpack配置文件
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
    app: ["./src/main.js"]
  },
  output: {
    path: __dirname + "/../build",
    publicPath: "",
    filename: "[name]-[hash:4].js"
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  },
  devtool: '#cheap-module-source-map',
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"development"'
    }),
    new HtmlWebpackPlugin({
      template: __dirname + "/../src/index.html"
    }),


  ]
}
