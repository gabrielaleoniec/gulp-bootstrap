// sass-lint:disable border-zero
/*! 
 * Created on : 2018-02-01, 12:40:21
 * Author     : Gabriela Leoniec <gabriela.leoniec@gmail.com>
 */

var gulp = require('gulp');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var eslint = require('gulp-eslint');
var print = require('gulp-print').default;
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var inject = require("gulp-inject");
// TODO: var sassdoc = require('sassdoc');
var fs = require('fs');

var dir = './public/assets/';
var dir_css = dir + 'css/';
var dir_sass = dir + 'sass/';
var dir_js = dir + 'js/';
var dir_maps = dir + 'maps/';
var dir_html = './public/';

fs.lstat(dir, (err) => {
  if (err)
    return console.log(err); //Handle error
});
fs.lstat(dir_sass, (err) => {
  if (err)
    return console.log(err); //Handle error
}
);
fs.lstat(dir_css, (err) => {
  if (err)
    return console.log(err); //Handle error
});

gulp.task('sasslint', function () {
  return gulp.src(dir_sass + '**/*.s+(a|c)ss')
          .pipe(print())
          .pipe(sassLint({
            /*rules: {
             'class-name-format': {
             'allow-leading-underscore': false,
             'convention': 'camelcase'
             }
             },*/
            configFile: './sass-lint.yml'
          }))
          .pipe(sassLint.format())
          .pipe(sassLint.failOnError());
});

gulp.task('styles', () =>
  gulp.src(dir_css + 'src/**/*.css')
          .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
          }))
);

gulp.task('lint', function () {
  const hasFixFlag = (process.argv.slice(2).indexOf('--fix') >= 0);

  return gulp.src(dir_js + '/src/*.js')
          .pipe(print())
          .pipe(eslint({
            fix: hasFixFlag
          }))
          .pipe(eslint.format())
          .pipe(eslint.failAfterError());
});

gulp.task('sass', ['sasslint'], function () {
  return gulp.src([
            dir_sass + '*.s+(a|c)ss',
            '!' + dir_sass + '/**/_*/',
            '!' + dir_sass + '/**/critical/'
          ])
          .pipe(print())
          .pipe(sourcemaps.init())
          .pipe(sass({
            outputStyle: 'compressed' // Options: nested, expanded, compact, compressed
          }).on('error', sass.logError))
          .pipe(sourcemaps.write())
          .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
          }))
          .pipe(gulp.dest(dir_css));
});

gulp.task('sass_critical', ['sasslint'], function () {
  return gulp.src([
            dir_sass + 'critical.s+(a|c)ss'
          ])
          .pipe(print())
          .pipe(sass({
            outputStyle: 'compressed' // Options: nested, expanded, compact, compressed
          }).on('error', sass.logError))
          .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
          }))
          .pipe(gulp.dest(dir_css));
});

gulp.task('sass:watch', function () {
  gulp.watch(dir_sass + '**/*.s+(a|c)ss', ['sass']);
});

gulp.task('inject', ['sass_critical'], function () {
  gulp.src(dir_html + '*.html')
          .pipe(inject(gulp.src([dir_css + './critical.css']), {
            starttag: '<!-- inject:head:{{ext}} --><style>',
            endtag: '</style><!-- endinject -->',
            transform: function (filePath, file) {
              // return file contents as string
              return file.contents.toString('utf8').trim();
            }
          }))
          .pipe(gulp.dest(dir_html));
});

gulp.task('default', ['sass', 'inject', 'lint'], function () {
});
