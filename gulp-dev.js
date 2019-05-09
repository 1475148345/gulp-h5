var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');//引入gulp-connect模块 
var autoprefixer = require('gulp-autoprefixer');
var fs = require('fs');
var postcss = require('gulp-postcss');
var px2rem = require('postcss-px2rem');
const CONFIG = {
    baseUrl: 'src',
    connect: {
        root: 'src',//根目录
        // ip:'192.168.11.62',//默认localhost:8080
        livereload: true,//自动更新
        port: 9999//端口
    },
    buildStatic: {//打包的资源
        title: 't-gulp',
        css: ['./css/main.css'],
        jsStart: ['./js/html-size-calculation.js'],
        jsEnd: ['./js/user.js']
    },
    js: 'src/js/*.js',//js文件目录
    sass: 'src/sass/*.scss',//scss文件目录
    css: 'src/css/',//css输出目录
    images: 'src/images/*',//images目录
    inIndex: 'index.html',//入口文件
    outIndex: 'src/index.html'//生成入口文件目录
}
gulp.task('sass', function () {
    var processors = [px2rem({ remUnit: 75 })];
    return gulp.src(CONFIG.sass)
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(CONFIG.css))
        .pipe(connect.reload());
});
gulp.task('js', function () {
    return gulp.src(CONFIG.js)
        .pipe(connect.reload());
});
/**
 * @description 配置资源路径
 * @param {params.file} 文件路径,默认当前路径
 * @param {params.title} 标题
 * @param {params.css} 样式
 * @param {params.jsStart} 页面加载前加载脚本
 * @param {params.jsEnd} 页面加载前后加载脚本
 *  */
function buildStatic(params) {
    let obj = {
        file: params.file || CONFIG.inIndex,
        ...params
    }
    let res, cssUrl = [], jsStartUrl = [], jsEndUrl = [];
    fs.readFile(obj.file, function (err, data) {
        var html = data.toString();

        // 标题
        res = html.replace('{{title}}', obj.title);

        // 加载样式
        cssUrl = obj.css.map(v => `<link rel="stylesheet" href="${v}"/>`);
        res = res.replace('{{linkCss}}', cssUrl.join(''));

        //加载脚本到头部
        jsStartUrl = obj.jsStart.length > 0 ? obj.jsStart.map(v => `<script src="${v}"></script>`) : [];
        res = res.replace('{{linkScriptStart}}', jsStartUrl.join(''));

        //加载脚本到末尾
        jsEndUrl = obj.jsEnd.length > 0 ? obj.jsEnd.map(v => `<script src="${v}"></script>`) : [];
        res = res.replace('{{linkScriptEnd}}', jsEndUrl.join(''));

        fs.writeFile(CONFIG.outIndex, res, 'utf-8', function (err, data) {
            if (err) { console.log(err); }
        });
    })
}
gulp.task('html', function () {
    buildStatic(CONFIG.buildStatic);
    return gulp.src(CONFIG.outIndex).pipe(connect.reload());
})
gulp.task('images', function () {
    return gulp.src(CONFIG.images).pipe(connect.reload());
});
gulp.task('connect', function () {
    connect.server(CONFIG.connect)
})
gulp.task('watchFile', function () {
    gulp.watch(CONFIG.inIndex, gulp.series('html'));
    gulp.watch(CONFIG.sass, gulp.series('sass'));
    gulp.watch(CONFIG.images, gulp.series('images'));
    gulp.watch(CONFIG.js, gulp.series('js'));
})
gulp.task('default', gulp.series(gulp.parallel('watchFile', 'sass', 'images', 'js', 'html', 'connect')));
