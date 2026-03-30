// Gulp core
declare module 'gulp' {
	const gulp: any;
	export default gulp;
	export const src: any;
	export const dest: any;
	export const watch: any;
	export const series: any;
	export const parallel: any;
}

// Gulp plugins
declare module 'gulp-beautify' {
	const beautify: {
		html: (options?: any) => any;
		css: (options?: any) => any;
		js: (options?: any) => any;
	};
	export default beautify;
}

declare module 'gulp-changed' {
	const changed: any;
	export const compareContents: any;
	export default changed;
}

declare module 'gulp-debug' {
	const debug: any;
	export default debug;
}

declare module 'gulp-file-include' {
	const fileInclude: any;
	export default fileInclude;
}

declare module 'gulp-filter' {
	const filter: any;
	export default filter;
}

declare module 'gulp-htmlclean' {
	const htmlClean: any;
	export default htmlClean;
}

declare module 'gulp-plumber' {
	const plumber: any;
	export default plumber;
}

declare module 'gulp-postcss' {
	const postcss: any;
	export default postcss;
}

declare module 'gulp-replace' {
	const replace: any;
	export default replace;
}

declare module 'gulp-sass' {
	const gulpSass: any;
	export default gulpSass;
}

declare module 'gulp-size' {
	const size: any;
	export default size;
}

// PostCSS plugins
declare module 'autoprefixer' {
	const autoprefixer: any;
	export default autoprefixer;
}

declare module 'cssnano' {
	const cssnano: any;
	export default cssnano;
}

declare module 'postcss-discard-unused' {
	const discardUnused: any;
	export default discardUnused;
}

declare module 'postcss-normalize-whitespace' {
	const normalizeWhitespace: any;
	export default normalizeWhitespace;
}

// Только ОДИН раз для postcss-sort-media-queries (удален дубль!)
declare module 'postcss-sort-media-queries' {
	const sortMediaQueries: any;
	export default sortMediaQueries;
}

// Webpack
declare module 'webpack' {
	const webpack: any;
	export default webpack;
}

declare module 'webpack-stream' {
	const webpackStream: any;
	export default webpackStream;
}

declare module 'terser-webpack-plugin' {
	const TerserPlugin: any;
	export default TerserPlugin;
}

// Sass
declare module 'sass' {
	const sass: any;
	export default sass;
}

// Utilities
declare module 'rimraf' {
	const rimraf: any;
	export { rimraf };
}

// Babel loader for webpack
declare module 'babel-loader' {
	const babelLoader: any;
	export default babelLoader;
}