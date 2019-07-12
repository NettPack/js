import webpack from 'webpack'

/**
 * @param moduleName
 * @param config
 * @param {NettPack} NettPack
 * @return {{}}
 */
export default function(moduleName, config, NettPack) {

	let plugins = [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
	];

	let baseConfig = {
		entry: {},
		mode: process.env.NODE_ENV,
		resolve: {
			alias: {}
		}
	};

	let entryApp = [];
	if (process.env.NODE_ENV === "development") {
		plugins.push(new webpack.HotModuleReplacementPlugin());
		entryApp.push(
			"webpack-hot-middleware/client?path="+ config.host + config.publicPath + "/" + moduleName + "/__webpack_hmr&timeout=" + config.webpackHmr + "&noInfo=" + config.noInfo
		);
		baseConfig.devServer = {
			publicPath: config.publicPath + "/" + moduleName
		}
	}

	baseConfig.entry.app = entryApp;
	baseConfig.plugins = plugins;

	return baseConfig;
};
