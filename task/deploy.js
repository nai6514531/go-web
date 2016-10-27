const gulp = require('gulp');
const sequence = require('run-sequence');
const shell = require('gulp-shell');
var template = require('gulp-template');
var config = require('config');
const version = config.get('version');
const imageUrl = config.get('image.url');
const author = config.get('author');
const name = config.get('name');
var run = require('gulp-run');

gulp.task('docker:config', function () {
	gulp
		.src('./config/docker/Dockerfile', {
			base: './config/docker'
		})
		.pipe(template({
			env: config.util.getEnv('NODE_ENV'),
			config: config
		}))
		.pipe(gulp.dest('./'))
});

gulp.task('docker:login', shell.task([
	'eval $(docker-machine env default)',
	`docker login ${imageUrl}`
],{interactive:true}));

gulp.task('docker:build', shell.task([
	`docker build -t ${imageUrl}/${author}/${name}:v${version} .`
]));

gulp.task('docker:remove', shell.task([
	`docker rmi ${imageUrl}/${author}/${name}:v${version}`
]));

gulp.task('docker:push', shell.task([
	`docker push ${imageUrl}/${author}/${name}:v${version}`
]));

gulp.task('k8s:config', function () {
	gulp
		.src('./config/k8s/*.yaml', {
			base: './config/k8s'
		})
		.pipe(template({
			config: config
		}))
		.pipe(gulp.dest('./k8s'))
});

gulp.task('k8s:ctx', ()=> {
	if (process.env.NODE_ENV == 'development') {
		run('kubectl config set current-context dev').exec();
	} else if (process.env.NODE_ENV == 'production') {
		run('kubectl config set current-context prod').exec();
	} else {
		run('kubectl config set current-context local').exec();
	}
});

gulp.task('k8s:delete', shell.task([
	`kubectl delete rc ${name}`,
	`kubectl delete svc ${name}`,
	`kubectl delete ing ${name}`
]));

gulp.task('k8s:create', shell.task([
	`kubectl create -f ./k8s/rc.yaml`,
	`kubectl create -f ./k8s/svc.yaml`,
	`kubectl create -f ./k8s/ing.yaml`
]));

