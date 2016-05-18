// Gulp imports
import gulp from 'gulp';
// TODO: Remove dependency on gulp-rollup as it is blacklisted by Gulp
import rollup from 'gulp-rollup';
import postcss from 'gulp-postcss';
import gulpif from 'gulp-if';
import sourcemap from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

// Rollup (JS) imports
import babel from 'rollup-plugin-babel';

// PostCSS Imports
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

// Other Imports
import yargs from 'yargs';

const argv = yargs.argv;
const isProd = argv.prod;

/**
 * Build JS
 */
gulp.task('build:js', () => gulp.src('lib/debut.js')
  .pipe(rollup({
    sourceMap: !isProd,
    format: 'umd',
    moduleName: 'debut',
    plugins: [
      babel({
        presets: ['es2015-rollup'],
        babelrc: false,
      }),
    ],
  }))
  .pipe(gulpif(!isProd, sourcemap.write()))
  .pipe(gulpif(isProd, uglify()))
  .pipe(gulp.dest('dist'))
);

/**
 * Build CSS
 */
gulp.task('build:css', () => {
  const processors = [autoprefixer()];

  if (isProd) {
    processors.push(cssnano());
  }

  return gulp.src('lib/debut.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('dist'));
});

/**
 * Build Everything
 */
gulp.task('build', ['build:css', 'build:js'], () => undefined);

/**
 * Watch
 */
gulp.task('watch', ['build'], () => {
  gulp.watch('styles/**', ['build:css']);
  gulp.watch('lib/**', ['build:js']);
});
