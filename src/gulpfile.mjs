import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';

const sass = gulpSass(dartSass);

export const buildStyles = () => (
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('../build/css'))
);

export const minifyJs = () => (
  gulp.src('./js/**/*.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('../build/js'))
);

export const copyFonts = () => (
  gulp.src('./assets/fonts/**/*')
    .pipe(gulp.dest('../build/fonts'))
);


export const watchFiles = () => {
  gulp.watch('./sass/**/*.scss', buildStyles);
  gulp.watch('./js/**/*.js', minifyJs);
  gulp.watch('./assets/fonts/**/*', copyFonts);
};

export const build = gulp.parallel(buildStyles, minifyJs, copyFonts);

export default gulp.series(
  build, // Run the build task first
  watchFiles
);
