var webpack = require('webpack');
var path = require('path');
var config = require('config');
var pkg = require('../package.json')

var APP_PATH = path.resolve(__dirname, '../src/static/js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;
module.exports = {
  context: APP_PATH,
  entry: {
    app: './app/main.jsx',
    signin: './signin/main.jsx'
  },
  output: {
    filename: 'entry/[name].js',
    chunkFilename: 'chunk/[name]-[chunkhash].js',
    publicPath: '/static/'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel', // 'babel-loader' is also a legal name to reference
      query: {
        presets: ['es2015', 'react', 'stage-0'],
        plugins: ['antd']
      }
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
      // loader: "style!css"
    }, {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader?relativeUrls")
      // loader: "style!css!less?relativeUrls"
    }, {
      test: /\.(png|jpg|jpeg|gif|woff|eot|ttf|svg)$/,
      loader: "file?name=asset/[hash].[ext]"
    }]
  },
  devtool: "source-map",
  plugins: [
    new ExtractTextPlugin("css/[name].css"),
    new CSSSplitWebpackPlugin({size: 4000,imports: true,filename:"css-chunk/[name]-[part].[ext]"}),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'staging'),
      __ENV__: {
        GA: JSON.stringify(config.get('analytics.google-analytics.id')),
        BUILT_AT: JSON.stringify(+new Date()),
        ENV: JSON.stringify(process.env.NODE_ENV || 'staging'),
        PKG_NAME: JSON.stringify(pkg.name),
      },
    }),
    new webpack.ProgressPlugin(function (percentage, message) {
      const percent = Math.round(percentage * 100);
      // process.stderr.clearLine();
      // process.stderr.cursorTo(0);
      // process.stderr.write(percent + '% ' + message);
    }),
  ],
};
