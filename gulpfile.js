/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  data = require('gulp-data'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  pump = require('pump'),
  concat = require('gulp-concat'),
  browserSync = require('browser-sync');

/*
 * Directories here
 */
var paths = {
  public: './public/',
  sass: './src/sass/',
  js: './public/js/',
  css: './public/css/',
  data: './src/_data/'
};

/**
 * Compile .pug files and pass in data from json file
 * matching file name. index.pug - index.pug.json
 */
gulp.task('pug', function () {
  return gulp.src('./src/*.pug')
    // .pipe(data(function (file) {
    //   return require(paths.data + path.basename(file.path) + '.json');
    // }))
    .pipe(pug())
    .pipe(gulp.dest(paths.public));
});

gulp.task('js', function() {
	pump([
		gulp.src('./src/js/*.js'),
		concat('dist.js'),
		uglify(),
		gulp.dest(paths.js)
	]);
	return;
});

/**
 * Recompile .pug files and live reload the browser
 */
gulp.task('rebuild', ['pug'], function () {
  browserSync.reload();
});

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['sass', 'pug', 'js'], function () {
  browserSync({
    server: {
      baseDir: paths.public
    },
    notify: true
  });
});

/**
 * Compile .scss files into public css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('sass', function () {
  return gulp.src(paths.sass + '*.sass')
    .pipe(sass({
      includePaths: [paths.sass],
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});

/**
 * Watch scss files for changes & recompile
 * Watch .pug files run pug-rebuild then reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch(paths.sass + '**/*.sass', ['sass']);
  gulp.watch('./src/**/*.pug', ['rebuild']);
  gulp.watch('./src/js/*.js', ['js', 'rebuild']);
});

// Build task compile sass and pug.
gulp.task('build', ['sass', 'pug', 'js']);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['browser-sync', 'watch']);
