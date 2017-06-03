"use strict";
// include gulp
var gulp = require("gulp");

// include plug-ins
var changed = require("gulp-changed");
var minifyHTML = require("gulp-minify-html");
var concat = require("gulp-concat");
var autoprefix = require("gulp-autoprefixer");
var minifyCSS = require("gulp-minify-css");
var rename = require("gulp-rename");
var stripDebug = require("gulp-strip-debug");
var uglify = require("gulp-uglify");
var gulpif = require("gulp-if");
var del = require("del");
var argv = require("minimist")(process.argv.slice(2));

var paths = {
  dist: {
    root: "./dist"
  },
  html: {
    src: "./src/partials/*.html",
    dest: "./dist/partials",
    index: "./src/index.html"
  },
  css: {
    src: [
      "./node_modules/bootswatch/yeti/bootstrap.css",
      "./node_modules/font-awesome/css/font-awesome.css",
      "./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css",
      "./src/css/*.css"
    ],
    dest: "./dist/css"
  },
  fonts: {
    src: [
      "./node_modules/font-awesome/fonts/fontawesome-webfont.*",
      "./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.*"
    ],
    dest: "./dist/fonts"
  },
  js: {
    src: [
      "./node_modules/jquery/dist/jquery.js",
      "./node_modules/angular/angular.js",
      "./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
      "./node_modules/angulartics/dist/angulartics.min.js",
      "./node_modules/angulartics/dist/angulartics-ga.min.js",
      "./node_modules/jquery/dist/jquery.min.js",
      "./node_modules/angular-route/angular-route.js",
      "./node_modules/bootstrap/dist/js/bootstrap.js",
      "./src/js/*.js"
    ],
    dest: "./dist/js"
  }
};

// minify new or changed HTML pages
gulp.task("minify-html", function() {
  var opts = {
    empty: true,
    quotes: true
  };

  return gulp
    .src(paths.html.src)
    .pipe(changed(paths.html.dest))
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest(paths.html.dest));
});

// CSS concat, auto prefix, minify, then rename output file
gulp.task("minify-css", function() {
  return gulp
    .src(paths.css.src)
    .pipe(concat("styles.css"))
    .pipe(autoprefix("last 2 versions"))
    .pipe(minifyCSS({ processImport: false }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(paths.css.dest));
});

gulp.task("copy-static", function() {
  return gulp.src(paths.html.index).pipe(gulp.dest(paths.dist.root));
});

gulp.task("copy-fonts", function() {
  return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
});

// JS concat, strip debugging code and minify
gulp.task("bundle-scripts", function() {
  gulp
    .src(paths.js.src)
    .pipe(concat("spotlistr.js"))
    .pipe(gulpif(!!argv["release"], stripDebug()))
    .pipe(gulpif(!!argv["release"], uglify({ mangle: false })))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task("clean", function(cb) {
  del(["./dist"], cb);
});

// default gulp task
gulp.task(
  "default",
  ["minify-html", "copy-fonts", "bundle-scripts", "minify-css", "copy-static"],
  function() {
    // watch for HTML changes
    gulp.watch(paths.html.src, ["minify-html"]);
    // watch for JS changes
    gulp.watch(paths.js.src, ["bundle-scripts"]);
    // watch for CSS changes
    gulp.watch(paths.css.src, ["minify-css"]);
  }
);
