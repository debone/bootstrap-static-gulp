"use strict";

const gulp = require( "gulp" ),
      browserify =  require( "browserify" ),
      source = require( "vinyl-source-stream" ),
      buffer = require( "vinyl-buffer" ),
      plugins = require( "gulp-load-plugins" )();

const dirs = {
  src: [ "!node_modules/**/*"],
  dev: {
    root: ".tmp/",
    styles: ".tmp/styles/",
    scripts: ".tmp/scripts/"
  }
};

gulp.task( "pug", () => {
  gulp.src(  [ ...dirs.src, "./**/*.pug" ] )
      .pipe( plugins.pug( { /*Someday, yamls... */  } ) )
      .pipe( gulp.dest( dirs.dev.root ) );
} );

gulp.task( "html", () => (
  gulp.src(  [ ...dirs.src, "./**/*.html" ] )
      .pipe( gulp.dest( dirs.dev.root ) )
) );

gulp.task( "js", () => {
  let b = browserify( {
    entries: "./scripts/main.js",
    debug: true
  } );

  return b.bundle()
          .pipe( source( "./main.js" ) )
          .pipe( buffer() )
          .pipe( gulp.dest( `${ dirs.dev.scripts }` ) );
});

gulp.task( "sass-dev", () => (
  gulp.src( `./styles/main.scss` )
      .pipe( plugins.sourcemaps.init() )
      .pipe( plugins.sass.sync().on( "error", plugins.sass.logError ) )
      .pipe( plugins.autoprefixer() )
      .pipe( plugins.sourcemaps.write( "." ) )
      .pipe( gulp.dest( dirs.dev.styles ) )
) );

gulp.task( "watch", () => {
  gulp.watch( [ ...dirs.src, `styles/**/*.scss` ], [ "sass-dev" ] );
  gulp.watch( [ ...dirs.src, `scripts/**/*.js` ], [ "js" ] );
  gulp.watch( [ ...dirs.src, `**/*.pug` ], [ "pug" ] );
  gulp.watch( [ ...dirs.src, `**/*.html` ], [ "html" ] );
} );

gulp.task( "livereload", () => (
  plugins.watch( [ ".tmp/**/*" ] )
          .pipe( plugins.connect.reload() )
) );

gulp.task( "webserver", () => {
  plugins.connect.server( {
    root: [ ".", ".tmp" ],
    livereload: true
  } );
} );

gulp.task( "prod", [ "webserver" ] );
gulp.task( "dev", [ "sass-dev", "js", "html", "pug" ] );

gulp.task( "default", [ "dev", "webserver", "watch", "livereload" ] );
