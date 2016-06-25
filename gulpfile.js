var gulp = require('gulp');
var jsx = require('gulp-jsx');
 
gulp.task('default', function() {
  return gulp.src('Resources/views/**/*.jsx')
    .pipe(jsx({
      factory: 'React.createClass'
    }))
    .pipe(gulp.dest('dist'));
});