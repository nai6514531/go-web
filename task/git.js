var gulp = require('gulp');
var runSequence = require('run-sequence');
var bump = require('gulp-bump');
var gutil = require('gulp-util');
var git = require('gulp-git');
var fs = require('fs');

gulp.task('bump-version', function () {
// 注意：这里我硬编码了更新类型为 'patch'，但是更好的做法是用
//      minimist (https://www.npmjs.com/package/minimist) 通过检测一个命令行参数来判断你正在做的更新是
//      一个 'major'， 'minor' 还是一个 'patch'。
	return gulp.src(['./bower.json', './package.json'])
		.pipe(bump({type: "patch"}).on('error', gutil.log))
		.pipe(gulp.dest('./'));
});

gulp.task('git:commit', function () {
	return gulp.src('.')
		.pipe(git.commit('[Prerelease] Bumped version number', {args: '-a'}));
});

gulp.task('git:push', function (cb) {
	git.push('origin', 'master', cb);
});

gulp.task('git:tag', function (cb) {
	var version = getPackageJsonVersion();
	git.tag(version, 'Created Tag for version: ' + version, function (error) {
		if (error) {
			return cb(error);
		}
		git.push('origin', 'master', {args: '--tags'}, cb);
	});
	function getPackageJsonVersion() {
		return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
	}
});

gulp.task('release', function (callback) {
	runSequence(
		'bump-version',
		'commit-changes',
		'push-changes',
		'create-new-tag',
		function (error) {
			if (error) {
				console.log(error.message);
			} else {
				console.log('RELEASE FINISHED SUCCESSFULLY');
			}
			callback(error);
		});
});
