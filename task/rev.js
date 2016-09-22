var gulp = require('gulp');
var rev = require('gulp-rev');
var replace = require('gulp-rev-replace');
var del = require('del');
var vinylPaths = require('vinyl-paths');

gulp.task('rev', function () {
	return gulp.src('./src/build/static/entry/*.js', {
		base: './src/build'
	})
		.pipe(vinylPaths(del))
		.pipe(rev())
		.pipe(gulp.dest('./src/build/'))
		.pipe(rev.manifest())
		.pipe(gulp.dest('./src/build/'));
});

gulp.task('rev-replace', function () {
	return gulp.src('./src/template/**/*.html')
		.pipe(replace({
			manifest: gulp.src('./src/build/rev-manifest.json'),
			replaceInExtensions: ['.html']
		}))
		.pipe(gulp.dest('./src/build/template'))
});
