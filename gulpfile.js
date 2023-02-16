// node v16.6.1

// 【更新履歴】
// _modeがfileの場合、resources/assets/viewsを削除する
// デフォルトで、pugのコンパイルに対応
// _modeを追加（default, file, shopify)

const _mode = "file"; // default, shopify,
// default : scss, js, image, pug のコンパイル,バンドル及びミニファイが行われる。
// shopify : 作成したファイルが_path.distに剥き出しのまま保存される。
//           その後、cssとjsは自動でshopifyのassetsにコピーされる。画像は手動でコピーが必要。
// file : html納品用。_path.distFile.viewsを、resourcesの親ディレクトリに拡張子.htmlにリネームしてコピーする。

const _autoBrowserReload = false; //自動でブラウザーをリロードするか
const _proxy = "localhost:8080";

const _path = {
  src: {
    sass: "./resources/src/sass/**/*.scss",
    js: "./resources/src/js/**/*.js",
    images: "./resources/src/images/**/*.{jpg,png,gif,svg}",
    pug: "./resources/src/pug/**/*.pug",
  },

  distDir: {
    css: "./resources/assets/css",
    cssmap: "../cssmap",
    js: "./resources/assets/js",
    images: "./resources/assets/images",
    views: "./resources/assets/views",
  },

  distFile: {
    all: "./resources/assets/**/*",
    css: "./resources/assets/**/*.css",
    cssmap: "./resources/assets/**/*.css.map",
    images: "./resources/assets/**/*.{jpg,png,gif,svg}",
    js: "./resources/assets/**/*.js",
    webp: "./resources/assets/**/*.webp",
    views: "./resources/assets/**/*.php",
  },

  copy: {
    css: {
      to: null,
      from: null,
    },
    js: {
      to: null,
      from: null,
    },
    views: {
      to: null,
      from: null,
    },
  },
};

/***************************************/

if (_mode === "file") {
  _path.copy.views.to = "./";
  _path.copy.views.from = "./resources/assets/views/**/*.php";
}

if (_mode === "shopify") {
  _path.distDir.css = "./resources/assets";
  _path.distDir.cssmap = true;
  _path.distDir.js = "./resources/assets";

  _path.copy.css.to = "../assets";
  _path.copy.css.from = "./resources/assets/**/*.css";
  _path.copy.js.to = "../assets";
  _path.copy.js.from = "./resources/assets/**/*.js";
}

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const del = require("del");
const rename = require("gulp-rename");
const bs = require("browser-sync").create();

//pug
const pug = require("gulp-pug");
const gulpData = require("gulp-data");
const imageSize = require("image-size");
const path = require("path");
const sourcePath = path.resolve(__dirname);

//sass
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");

//img
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const mozjpeg = require("imagemin-mozjpeg");
const svgo = require("imagemin-svgo");
const gifsicle = require("imagemin-gifsicle");

//webp
const webp = require("gulp-webp");

//webpack
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");
const { parallel } = require("gulp");

/***************************************/

async function copyCss(done) {
  if (_mode === "shopify") {
    await gulp.src(_path.copy.css.from).pipe(gulp.dest(_path.copy.css.to));
  }
  done();
}
async function copyJs(done) {
  if (_mode === "shopify") {
    await gulp.src(_path.copy.js.from).pipe(gulp.dest(_path.copy.js.to));
  }
  done();
}

async function deleteViews(done) {
  await del(_path.distFile.views);
  if (_mode === "file") {
    await del([_path.copy.views.to + "**/*.html", "!node_modules/**/*.html"]);
  }
  done();
}
function compilePug() {
  return gulp
    .src([_path.src.pug, "!" + _path.src.pug.replace("**/*", "**/_*")])
    .pipe(plumber())
    .pipe(
      gulpData((file) => {
        return {
          imageSize: (src) => {
            const filePath = src.startsWith("/")
              ? path.resolve(sourcePath, src.slice(1))
              : path.resolve(sourcePath, src.replace(/(\.\.\/)/g, ""));
            const replaceFilePath = filePath.replace("assets", "src");

            return imageSize(replaceFilePath);
          },
        };
      })
    )
    .pipe(
      pug({
        // pretty: true,
        basedir: _path.src.pug.replace("/**/*.pug", ""),
      })
    )
    .pipe(
      rename({
        extname: ".php",
      })
    )
    .pipe(gulp.dest(_path.distDir.views));
}
function copyViews(done) {
  if (_mode === "file") {
    return gulp
      .src(_path.copy.views.from)
      .pipe(rename({ extname: ".html" }))
      .pipe(gulp.dest(_path.copy.views.to));
  }
  done();
}
// _modeがfileの場合phpファイルは削除する
async function putAwayViews(done) {
  if (_mode === "file") {
    await del(_path.distDir.views);
  }
  done();
}

async function deleteJs(done) {
  await del(_path.distFile.js);
  done();
}
function compileJs() {
  return webpackStream(webpackConfig, webpack).pipe(
    gulp.dest(_path.distDir.js)
  );
}

async function deleteCss(done) {
  await del([_path.distFile.css, _path.distFile.cssmap]);
  done();
}
function compileSass() {
  return gulp
    .src(_path.src.sass, { sourcemaps: true })
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )
    .pipe(autoprefixer({}))
    .pipe(gulp.dest(_path.distDir.css, { sourcemaps: _path.distDir.cssmap }));
}

async function deleteImages(done) {
  await del(_path.distFile.images);
  done();
}
function minifyImages() {
  return gulp
    .src(_path.src.images)
    .pipe(
      imagemin([
        pngquant({
          quality: [0.65, 0.8],
          speed: 1,
          floyd: 0,
        }),
        mozjpeg({
          quality: 85,
          progressive: true,
        }),
        svgo({}),
        gifsicle({}),
      ])
    )
    .pipe(gulp.dest(_path.distDir.images));
}

async function deleteWebp(done) {
  await del(_path.distFile.webp);
  done();
}
function convertWebp() {
  return gulp
    .src(_path.src.images.replace(",gif,svg", ""))
    .pipe(
      rename(function (path) {
        path.basename += path.extname;
      })
    )
    .pipe(webp())
    .pipe(gulp.dest(_path.distDir.images));
}

async function clean(done) {
  await del(_path.distFile.all);
  if (_mode === "file") {
    await del([_path.copy.views.to + "**/*.html", "!node_modules/**/*.html"]);
  }
  done();
}

function startServer(done) {
  bs.init({
    proxy: _proxy,
  });
  done();
}
function browserReload(done) {
  bs.reload();
  done();
}

function watchStart(done) {
  gulp.watch(
    _path.src.pug,
    { ignoreInitial: false },
    gulp.series(deleteViews, compilePug, copyViews, putAwayViews)
  );

  gulp.watch(
    _path.src.sass,
    { ignoreInitial: false },
    gulp.series(deleteCss, compileSass, copyCss)
  );

  gulp.watch(
    _path.src.js,
    { ignoreInitial: false },
    gulp.series(deleteJs, compileJs, copyJs)
  );

  gulp.watch(
    _path.src.images,
    { ignoreInitial: false },
    gulp.series(
      gulp.parallel(deleteImages, deleteWebp),
      minifyImages,
      convertWebp
    )
  );

  if (_autoBrowserReload) {
    bs.init({
      proxy: _proxy,
    });

    gulp.watch(
      [
        _path.distFile.css,
        _path.distFile.js,
        _path.distFile.images,
        _path.distFile.views,
        "./resources/views/**/*.php",
      ],
      browserReload
    );
  }

  done();
}

exports.pug = gulp.series(deleteViews, compilePug, copyViews, putAwayViews);
exports.sass = gulp.series(deleteCss, compileSass);
exports.imagemin = gulp.series(deleteImages, minifyImages);
exports.webp = gulp.series(deleteWebp, convertWebp);
exports.webpack = gulp.series(deleteJs, compileJs);
exports.serve = startServer;
exports.build = gulp.series(
  clean,
  parallel(compileSass, minifyImages, convertWebp, compileJs, compilePug),
  parallel(copyCss, copyJs, copyViews),
  putAwayViews
);
exports.default = watchStart;
