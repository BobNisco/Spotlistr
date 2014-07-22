// include gulp
var gulp = require('gulp');

// include plug-ins
var changed = require('gulp-changed');
var minifyHTML = require('gulp-minify-html');
var concat = require('gulp-concat');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');

// minify new or changed HTML pages
gulp.task('minify-html', function() {
	var opts = {
		empty: true,
		quotes: true
	};
	var htmlPath = {
		htmlSrc: './public/partials/*.html',
		htmlDest: './public/dist/partials'
	};

	return gulp.src(htmlPath.htmlSrc)
		.pipe(changed(htmlPath.htmlDest))
		.pipe(minifyHTML(opts))
		.pipe(gulp.dest(htmlPath.htmlDest));
});

// CSS concat, auto prefix, minify, then rename output file
gulp.task('minify-css', function() {
	var cssPath = {
		cssSrc: ['./public/css/*.css',
			'!*.min.css',
			'!/**/*.min.css',
			'./public/bower_components/bootswatch/yeti/bootstrap.css',
			'./public/bower_components/font-awesome/css/font-awesome.css'],
		cssDest: './public/dist/css'
	};

	return gulp.src(cssPath.cssSrc)
		.pipe(concat('styles.css'))
		.pipe(autoprefix('last 2 versions'))
		.pipe(minifyCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(cssPath.cssDest));
});

gulp.task('copy-fonts', function() {
	var fontPath = {
		fontSrc: ['./public/bower_components/font-awesome/fonts/fontawesome-webfont.*'],
		fontDest: './public/dist/fonts'
	};

	return gulp.src(fontPath.fontSrc)
		.pipe(gulp.dest(fontPath.fontDest));
});

// JS concat, strip debugging code and minify
gulp.task('bundle-scripts', function() {
	var jsPath = {
		jsSrc: [
			'./public/bower_components/angular/angular.js',
			'./public/bower_components/angulartics/dist/angulartics.min.js',
			'./public/bower_components/angulartics/dist/angulartics-ga.min.js',
			'./public/bower_components/jquery/dist/jquery.min.js',
			'./public/bower_components/angular-route/angular-route.js',
			'./public/bower_components/bootstrap/dist/js/bootstrap.js',
			'./public/js/*.js',
		],
		jsDest:'./public/dist/js'
	};

	gulp.src(jsPath.jsSrc)
		.pipe(concat('ngscripts.js'))
		.pipe(stripDebug())
		.pipe(uglify({mangle: false}))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(jsPath.jsDest));
});

// default gulp task
gulp.task('default', ['minify-html', 'copy-fonts', 'bundle-scripts', 'minify-css'], function() {
	// watch for HTML changes
	gulp.watch('./public/partials/*.html', ['minify-html']);
	// watch for JS changes
	gulp.watch('./public/js/*.js', ['bundle-scripts']);
	// watch for CSS changes
	gulp.watch('./public/css/*.css', ['minify-css']);
});
