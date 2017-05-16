var config = require("./webpack.config.js");
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var JsDocPlugin = require('jsdoc-webpack-plugin');

config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/");
config.plugins.push(new JsDocPlugin({
	conf: __dirname + "/jsdoc.conf"
}))
var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true
    }
});
server.listen(8080);
