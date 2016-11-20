var Promise = require('bluebird');
var gulp = require('gulp');
var sequence = require('run-sequence');
var bump = require('gulp-bump');
var gutil = require('gulp-util');
var git = require('gulp-git');
var fs = require('fs');
var config = require('config');
var moment = require('moment');

/**
 *  format:
 *
 *    YYYYMMDD.X
 *
 *  e.g.:
 *
 *    20161121.1
 *
 */
function getVersion() {
  var today = moment().format('YYYYMMDD');
  var prefix = today + '.';
  Promise.promisify(git.exec)({ args: `tag -l "${prefix}*"` })
    .then(function (stdout) {
      var tags = stdout.trim().split('\n').map(function (tag) {
        return +tag.slice(prefix.length);
      });
      return Math.max.apply(Math, tags);
    }, function (err) {
      return 0;
    })
    .then(function (latest) {
      return prefix + (latest + 1)
    })
}

gulp.task('git:release:commit', function () {
  return gulp.src('.')
    .pipe(git.commit('[Release] Bumped ' + getVersion(), {args: '-a'}));
});

gulp.task('git:release:push', function (cb) {
  git.push('origin', 'master', cb);
});

gulp.task('git:release:tag', function (cb) {
  var version = getVersion();
  git.tag(version, 'Created Tag for version: ' + version, function (error) {
    if (error) {
      return cb(error);
    }
    git.push('origin', 'master', {args: '--tags'}, cb);
  });
});

gulp.task('git:release', function (callback) {
  sequence(
    'git:release:commit',
    'git:release:push',
    'git:release:tag',
    function (error) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('RELEASE FINISHED SUCCESSFULLY');
      }
      callback(error);
    });
});
