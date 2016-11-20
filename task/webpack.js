var _ = require('lodash');
var gulp = require('gulp');
var webpack = require('gulp-webpack');
const sequence = require('run-sequence');

gulp.task('webpack:dev', function () {
  return gulp.src('../package.json')
    .pipe(webpack(_.defaultsDeep({
      watch: true,
      output: {
        chunkFilename: 'chunk/[name].js'
      }
    }, require('./webpack.config.js'))))
    .pipe(gulp.dest('./src/build/static'));
});

gulp.task('webpack:prod', function () {
  return gulp.src('../package.json')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('./src/build/static'));
});


