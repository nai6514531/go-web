var webpack = require('webpack');
var path = require('path');
var APP_PATH = path.resolve(__dirname, '../src/static/js');

module.exports = {
	context: APP_PATH,
	entry: {
		app: './app/main.jsx',
		signin: './signin/main.jsx',
		stat: './stat/main.jsx'
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
			loader: "style!css"
		}, {
			test: /\.less$/,
			loader: "style!css!less?relativeUrls"
		}, {
			test: /\.(png|jpg|jpeg|gif|woff|eot|ttf|svg)$/,
			loader: "file?name=asset/[hash].[ext]"
		}]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
		}),
		new webpack.ProgressPlugin(function (percentage, message) {
			const percent = Math.round(percentage * 100);
			process.stderr.clearLine();
			process.stderr.cursorTo(0);
			process.stderr.write(percent + '% ' + message);
		})
	]
};
