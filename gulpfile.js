const NODE_ENV=process.env.NODE_ENV;
NODE_ENV==1?require('./gulp-dev.js'):require('./gulp-pro.js');