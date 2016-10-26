const gulp = require('gulp');
const sequence = require('run-sequence');
const shell = require('gulp-shell');
var template = require('gulp-template');
const version = require('../package.json').version;
const imageUrl = require('../package.json').image.url;
const author = require('../package.json').author;
const name = require('../package.json').name;

gulp.task('compile', shell.task([
	'CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build',
]));

gulp.task('build-image', shell.task([
	`docker build -t ${imageUrl}/${author}/${name}:v${version} .`
]));

gulp.task('remove-image', shell.task([
	`docker rmi ${imageUrl}/${author}/${name}:v${version}`
]));

gulp.task('push-image', shell.task([
	`docker push ${imageUrl}/${author}/${name}:v${version}`
]));

gulp.task('build-k8s-config', function () {
	gulp
		.src('./config/k8s/*.yaml', {
			base: './config/k8s'
		})
		.pipe(template({
			pkg: require('../package.json')
		}))
		.pipe(gulp.dest('./k8s'))
});
gulp.task('build-k8s-config-dev', function () {
	gulp
		.src('./config/k8s/dev-*.yaml', {
			base: './config/k8s'
		})
		.pipe(template({
			pkg: require('../package.json')
		}))
		.pipe(gulp.dest('./k8s'))
});

gulp.task('create-k8s', shell.task([
	`kubectl create -f ./k8s/rc.yaml`,
	`kubectl create -f ./k8s/svc.yaml`,
	`kubectl create -f ./k8s/ing.yaml`,
]));

gulp.task('delete-k8s', shell.task([
	`kubectl delete rc ${name}`,
	`kubectl delete svc ${name}`,
	`kubectl delete ing ${name}`,
]));
