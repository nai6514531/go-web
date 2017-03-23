const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('doc', shell.task([
  'aglio -i ./api.md --theme-variables flatly --theme-template triple -s',
]));
