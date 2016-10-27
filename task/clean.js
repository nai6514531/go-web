var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function (cb) {
	console.info('image:build:',require('config'))
	console.log('NODE_ENV: ' + require('config').util.getEnv('NODE_ENV'));
	return del(['./src/build'], {force: true}, cb);
});
