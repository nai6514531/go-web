var gulp = require('gulp');
var sequence = require('run-sequence');
var bump = require('gulp-bump');
var gutil = require('gulp-util');
var git = require('gulp-git');
var fs = require('fs');
var config = require('config');

function getVersion() {
	return JSON.parse(fs.readFileSync(`./config/${process.env.NODE_ENV || 'default'}.json`, 'utf8')).version;
}

gulp.task('git:commit', function () {
	return gulp.src('.')
		.pipe(git.commit('[Prerelease] Bumped v' + getVersion(), {args: '-a'}));
});

gulp.task('git:push', function (cb) {
	git.push('origin', 'master', cb);
});

gulp.task('git:tag', function (cb) {
	var version = getVersion();
	git.tag('v' + version, 'Created Tag for version: ' + version, function (error) {
		if (error) {
			return cb(error);
		}
		git.push('origin', 'master', {args: '--tags'}, cb);
	});

});

gulp.task('git:release', function (callback) {
	sequence(
		'git:commit',
		'git:push',
		'git:tag',
		function (error) {
			if (error) {
				console.log(error.message);
			} else {
				console.log('RELEASE FINISHED SUCCESSFULLY');
			}
			callback(error);
		});
});
