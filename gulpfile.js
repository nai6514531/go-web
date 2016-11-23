const gulp = require('gulp');
const sequence = require('run-sequence');
const shell = require('gulp-shell');

require('./task/clean');
require('./task/webpack');
require('./task/rev');
require('./task/minify');
require('./task/copy');
require('./task/git');
require('./task/doc');

gulp.task('default', () => {
  return sequence('clean', 'copy:img', 'copy:vendor', 'webpack:dev');
});

gulp.task('build', () => {
  return sequence('clean', 'copy:template', 'copy:img', 'copy:vendor', 'webpack:prod', 'rev', 'rev:replace', 'minify');
});

gulp.task('release', ['git:release']);
