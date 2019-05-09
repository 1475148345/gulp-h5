var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');//js压缩
var concat = require('gulp-concat');
var minifyCss = require("gulp-minify-css");//压缩CSS
var clean = require('gulp-clean');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var fs = require('fs');
var postcss = require('gulp-postcss');
var px2rem = require('postcss-px2rem');
const CONFIG = {
    baseUrl: 'dist',
    buildStatic: {//打包的资源
        title: 't-gulp',
        css: ['./css/main.css'],
        jsStart: [],
        jsEnd: ['./js/main.js'],
    },
    js: ['src/js/*.js'],//js文件目录
    sass: 'src/sass/*.scss',//scss文件目录
    css: 'dist/css/',//css输出目录
    images: 'src/images/*',//images目录
    inIndex: 'index.html',//入口文件
    outIndex: 'dist/index.html'//生成入口文件目录
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
        .pipe(concat('main.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(CONFIG.css))
});

gulp.task('js', function () {
    return gulp.src(CONFIG.js)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())//压缩js
        .pipe(gulp.dest(CONFIG.baseUrl + '/js'));
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
    let res, cssUrl = '', jsStartUrl = '', jsEndUrl = '';
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
})
gulp.task('images', function () {
    return gulp.src(CONFIG.images)
        .pipe(gulp.dest(CONFIG.baseUrl + '/images/'));
});
gulp.task('clean', function () {
    return gulp.src(CONFIG.baseUrl + '/*').pipe(clean());
})

gulp.task('default', gulp.series('clean', gulp.parallel('sass', 'js', 'html', 'images')));