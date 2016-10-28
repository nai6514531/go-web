'use strict';

var gulp = require('gulp');
var bump = require('gulp-bump');
var config = require('config');

gulp.task('bump:minor', function () {
	var options = {
		type: 'minor'
	};
	var env = '';
	if (!process.env.NODE_ENV) {
		env = 'default';
	} else {
		env = process.env.NODE_ENV;
	}
	return gulp.src(`./config/${env}.json`)
		.pipe(bump(options))
		.pipe(gulp.dest('./config'));
});
gulp.task('bump:patch', function () {
	var env = '';
	if (!process.env.NODE_ENV) {
		env = 'default';
	} else {
		env = process.env.NODE_ENV;
	}
	return gulp.src(`./config/${env}.json`)
		.pipe(bump())
		.pipe(gulp.dest('./config'));
});
