var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');

gulp.task('uglify', function () {
	return gulp.src('./src/build/static/**/*.js', {
		base: './src/build'
	})
		.pipe(uglify())
		.pipe(gulp.dest('./src/build'));
});

gulp.task('htmlmin', function () {
	return gulp.src('./src/build/template/**/*.html', {
		base: './src/build'
	})
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('./src/build'));
});

gulp.task('minify', ['uglify', 'htmlmin']);
