'use strict';

var gulp = require('gulp');
var bump = require('gulp-bump');

gulp.task('bump:minor', function () {
	var options = {
		type: 'minor'
	};
	gulp.src('./package.json')
		.pipe(bump(options))
		.pipe(gulp.dest('./'));
});
gulp.task('bump:patch', function () {
	gulp.src('./package.json')
		.pipe(bump())
		.pipe(gulp.dest('./'));
});
