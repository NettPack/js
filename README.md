# NettPack core

##### Nettpack core is plugin for building javascripts and styles by using WebPackConfig + Nette


### How to use:

- first create webpack configs for production and development mode

	- First please set nettpack host (path to your site) parameter in your config.local.neon parameters:
		````neon
		parameters:
			nettpack:
				host: http://domain
		````
	- example development config
	
		````javascript
		process.env.NODE_ENV = 'development';
		import express from "express";
		import webpack from 'webpack';
		import {NettPack} from "@nettpack/core"
		import webpackDevMiddleware from 'webpack-dev-middleware';
		import webpackHotMiddleware from 'webpack-hot-middleware';
		import fs from "fs";
		import myModule from "./path_to_your_module"
		let nett = new NettPack(__dirname + "/app/Config/config.local.neon");
		const app = express();
		
		const regex = /(^.*[\/])(.*)(\.\w{20})(\.js|\.css)$/gi;
		app.use(function(req, res, next) {
			if (!req.url) {
				return;
			}
			let result = regex.exec(req.url);
			if (result && result.length > 0) {
				req.url = result[1] + result[2] + result[4];
			}
			next();
		});
		
		nett.addAppModule("myModule", myModule);
		
		let data = nett.buildModules();
		
		for (let moduleName in data.modules) {
			let module = data.modules[moduleName];
			let compiler = webpack(module);
			app.use(webpackDevMiddleware(compiler, {
				publicPath: nett.config.publicPath + "/" + moduleName,
				noInfo: true
			}));
			app.use(webpackHotMiddleware(compiler, {
				hot: true,
				path: nett.config.publicPath + '/' + moduleName + '/__webpack_hmr'
			}));
		}
		
		let content = "module.exports = " + JSON.stringify({resolve: data.resolves});
		
		fs.writeFile('./webpack.export.config.js', content, function (err) {
			if (err) throw err;
			console.log('It\'s saved export webpack resolve!\n');
		});
		
		app.listen(nett.getAppPort());

		````
	- example production config
	
		````javascript
		process.env.NODE_ENV = 'production';
		import webpack from 'webpack';
		import {NettPack} from "@nettpack/core";
		import myModule from "./path_to_your_module"
		import fs from "fs";
		
		let nett = new NettPack(__dirname + "/app/Config/config.local.neon");
		nett.addAppModule("myModule", myModule);
		
		let data = nett.buildModules();
		
		let hashes = [];
		for (let moduleName in data.modules) {
			let module = data.modules[moduleName];
			webpack(module).run((error, stats) => {
				hashes.push({
					name: moduleName,
					hash: stats.hash
				});
				fs.writeFile('./webpack.hashes.js', JSON.stringify(hashes), function (err) {
					if (err) throw err;
					console.log('Hash saved!');
				});
				console.log(`Webpack stats: ${stats}`);
				return 0;
			})
		}
		````
	- example module (each module is webpack.config.js)
		````javascript
		import path from 'path';
		import webpack from 'webpack';
		import ExtractTextWebpackPlugin from "extract-text-webpack-plugin";
		
		module.exports = function () {
		
			let fileNameCss = '[name].[hash].css';
			let fileNameJs = '[name].[hash].js';
			if (process.env.NODE_ENV === 'development') {
				fileNameCss = '[name].css';
				fileNameJs = '[name].js';
			}
			const ExtractStylePlugin = new ExtractTextWebpackPlugin({
				filename: fileNameCss,
				disable: 'development' === process.env.NODE_ENV
			});
			return {
				entry: {
					app: [
						path.join(__dirname, '/../pathToYourEntryPoint')
					]
				},
				module: {
					rules: [
						{
							test: /\.js$/,
							use: {
								loader: 'babel-loader'
							}
						},
						{
							test: /\.(css|less)$/,
							use: ExtractStylePlugin.extract({
								use: [
									{ loader: "css-loader" },
									{ loader: "less-loader" },
								],
								fallback: "style-loader"
							})
						},
						{
							test: /\.(png|gif|woff|woff2|eot|ttf|svg)$/,
							loader: 'url-loader?limit=100000'
						}
					],
				},
				output:{
					path: path.join(__dirname, '/../../web/dist'),
					publicPath: "/dist",
					filename: fileNameJs
				},
				plugins: [
					new webpack.ProvidePlugin({
						$: "jquery",
						jquery: "jquery",
						jQuery: "jquery"
					}),
					ExtractStylePlugin
				],
			};
		};
		````
		
- How to insert another vendor package files into build collection:

	- First you must place this settings into your composer.json in your vendor package

	````json
	{
	.........
	.........
	.........,
	.........,
		"extra": {
			"nettpack": {
				"resolve": {
					"CustomName": "./src/Assets/main.js"
					}
				}
			}
	}
	````
	or using entry points
	````json
	{
	.........
	.........
	.........,
	.........,
		"extra": {
			"nettpack": {
				"entry": {
					"CustomName": "./src/Assets/main.js"
					}
				}
			}
	}
	````
	- Now you must create main.js file into /src/Assets, for example
	````javascript
	export * from './pathToYourJsFile.js'
	import './pathToYourStyles.less'
	````
	
- For run build or start development mode place this scripts into your package.json file:
	````json
	{
		"scripts": {
			"start": "npm run build && npm run babel-node",
			"prebuild": "npm run clean-dist",
			"clean-dist": "npm run remove-dist && mkdir ./web/dist",
			"remove-dist": "rimraf ./web/dist",
			"build": "./node_modules/.bin/babel-node ./webpack.production.js",
			"babel-node": "./node_modules/.bin/babel-node ./webpack.development.js",
			}
	}
  ````
