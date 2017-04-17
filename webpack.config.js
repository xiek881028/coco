const path = require('path');
const fs = require('fs');

const basePath = __dirname;
const prod = process.argv.indexOf('-p') >= 0 || process.argv.indexOf('--optimize-minimize') >= 0;
const env = prod ? 'production' : 'development';
const min = prod ? '.min' : '';

let webpack = require('webpack');
let webpackExtractTextPlugin = require('extract-text-webpack-plugin');
let htmlWebpackPlugin = require('html-webpack-plugin');
let webpackConfig = {
	entry: {
		common: path.join(basePath, 'src', 'js', 'common'),
		video: path.join(basePath, 'src', 'js', 'video'),
	},

	output: {
		path: path.join(basePath, 'dist', 'js'),
		filename: `[name]${min}.js`,
	},

	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.common.js',
		},
		// extensions: ['.js', '.web.js', '.webpack.js'],
	},

	externals: {
		axios: 'axios',
		vue: 'Vue',
		vuex: 'Vuex',
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				use: webpackExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						'css-loader?sourceMap',
						'postcss-loader',
					],
				}),
			},
			{
				test: /\.scss$/,
				use: webpackExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						'css-loader?sourceMap',
						'postcss-loader',
						'sass-loader?sourceMap',
					],
				}),
			},
			{
				test: /\.pug$/,
				use: ['pug-loader'],
				exclude: ['/node_modules/'],
			},
			// {
			// 	test: /\.js?$/,
			// 	use: ['babel-loader'],
			// 	exclude: /node_modules/,
			// },
			{
				test: /\.vue$/,
				use: [
					{
						loader: 'vue-loader',
						options: {
							loaders: {
								scss: webpackExtractTextPlugin.extract({
									fallback: 'vue-style-loader',
									use: [
										'css-loader?sourceMap',
										'postcss-loader',
										'sass-loader?sourceMap',
									],
								}),
							},
						},
					},
				],
			},
			{
				test: /\.(gif|jpe?g|png)(\?.*)?$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
							name: '../images/[name].[ext]',
						},
					},
				],
			},
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: `${env}`,
			},
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
		new webpackExtractTextPlugin(path.join('..', 'css', `[name]${min}.css`)),
	],
};

Object.keys(webpackConfig.entry).map(function(item){
		webpackConfig.plugins.push(
			new htmlWebpackPlugin({
				template: path.join(basePath, 'view', item=='common'?'index.pug':`${item}.pug`),
				filename: path.join('..', 'view', item=='common'?'index.html':`${item}.html`),
				hash: true,
				title: `${min}`,
				chunks:[item],
			})
		);
});

if(prod) {
	webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false,
		},
		sourceMap: true,
	}));
}

module.exports = webpackConfig;
