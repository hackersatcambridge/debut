'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var sequence = require('run-sequence');
var path = require('path');
var argv = require('yargs').argv;
var bs = require('browser-sync').create();
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var serveStatic = require('serve-static');

var isDist = argv.dist;

var onError = function (e) {
  $.util.beep();
  $.util.log(e.message);
  this.emit('end');
};

// Compile less files into a single css file
gulp.task('css', function () {
  return gulp.src(['less/main.less'], {base: path.join(process.cwd(), 'less')})
    .pipe($.plumber({
        errorHandler: onError
    }))
    .pipe($.autoprefixer({cascade: false}))
    .pipe($.rename('debut.css'))
    .pipe(gulp.dest('dist'))
    .pipe(bs.reload({ stream: true }))
    .pipe($.if(isDist, $.rename('debut.min.css')))
    .pipe($.if(isDist, $.minifyCss()))
    .pipe($.if(isDist, gulp.dest('dist')));
});

// Compile JS modules into a single JS file
gulp.task('js', function () {
  return browserify('lib/main.js', {
      standalone: 'Debut'
    })
    .transform(babelify)
    .bundle()
    .pipe(source('debut.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
    .pipe(bs.reload({ stream: true }))
    .pipe($.if(isDist, $.rename('debut.min.js')))
    .pipe($.if(isDist, $.uglify()))
    .pipe($.if(isDist, gulp.dest('dist')));
});

// Build the whole thing
gulp.task('build', function () {
  sequence(['css', 'js']);
});

// Watch for changes
gulp.task('watch', ['build'], function () {
  gulp.watch(['lib/*.js'], ['js']);
  gulp.watch(['less/*.less'], ['css']);
  gulp.watch('test/**', bs.reload);
});

gulp.task('serve', ['watch'], function () {
  bs.init({
    server: './test',
    open: false,
    middleware: serveStatic('./dist')
  });
});
