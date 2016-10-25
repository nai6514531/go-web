const gulp = require('gulp');
const sequence = require('run-sequence');
const shell = require('gulp-shell');

require('./task/clean');
require('./task/webpack');
require('./task/rev');
require('./task/minify');
require('./task/copy');
require('./task/bump');
require('./task/k8s');

gulp.task('default', () => {
	return sequence('clean', 'copy-img', 'webpack-dev');
});

gulp.task('build', () => {
	return sequence('clean', 'copy-template', 'copy-img', 'webpack', 'rev', 'rev-replace', 'minify');
});

gulp.task('local', shell.task([
	"godep go run main.go -conf ./config/local"
]));

gulp.task('deve', shell.task([
	'godep go run main.go -conf ./config/deve',
]));

gulp.task('prod', shell.task([
	'godep go run main.go -conf ./config/prod',
]));

gulp.task('doc', shell.task([
	'apidoc -i ./src/server/ -o doc/',
]));

gulp.task('compile:deve', () => {
	return sequence('build', 'compile');
});

gulp.task('deploy:deve', () => {
	return sequence('build-image', 'push-image', 'build-k8s-config', 'delete-k8s','create-k8s');
});
