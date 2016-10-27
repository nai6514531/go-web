const gulp = require('gulp');
const sequence = require('run-sequence');
const shell = require('gulp-shell');

require('./task/clean');
require('./task/webpack');
require('./task/rev');
require('./task/minify');
require('./task/copy');
require('./task/bump');
require('./task/deploy');

gulp.task('default', () => {
	return sequence('clean', 'copy:img', 'webpack:dev');
});

gulp.task('local', shell.task([
	"godep go run main.go -conf ./config/server/default"
]));

gulp.task('deve', shell.task([
	'godep go run main.go -conf ./config/server/development',
]));

gulp.task('prod', shell.task([
	'godep go run main.go -conf ./config/server/production',
]));

gulp.task('doc', shell.task([
	'apidoc -i ./src/server/ -o doc/',
]));
