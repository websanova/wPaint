module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        bitwise: true,
        camelcase: true,
        indent: 2,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        white: true,
        validthis: true,
        quotmark: 'single',
        globals: {
          'window': true,
          'jQuery': true,
          'document': true,
          'Image': true,
          'setTimeout': true,
          'clearTimeout': true,
          'event': true,
          'CanvasRenderingContext2D': true
        }
      },
      files: {
        src: ['./plugins/**/src/wPaint-*.js', './src/*.js']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      my_target: {
        files: {
          './wPaint.min.js': ['./src/wPaint.js', './src/wPaint.utils.js'],
          './plugins/main/wPaint.menu.main.min.js': ['./plugins/main/src/wPaint.menu.main.js', './plugins/main/src/fillArea.min.js'],
          './plugins/text/wPaint.menu.text.min.js': ['./plugins/text/src/wPaint.menu.text.js'],
          './plugins/shapes/wPaint.menu.main.shapes.min.js': ['./plugins/shapes/src/wPaint.menu.main.shapes.js', './plugins/shapes/src/shapes.min.js'],
          './plugins/file/wPaint.menu.main.file.min.js': ['./plugins/file/src/wPaint.menu.main.file.js']
       }
      }
    },
    stylus: {
      compile: {
        options: {
          import: ['nib', '../lib/mixins'],
        },
        files: {
          './wPaint.min.css': './src/wPaint.css'
        }
      }
    },
    concat: {
      basic_and_extras: {
        files: {
          'wPaint-min.js': ['./lib/wColorPicker.min.js', './wPaint.min.js'],
          'wPaint-min.css': ['./lib/wColorPicker.min.css', './wPaint.min.css'],
        },
      }
    },
    watch: {
      files: [
        './src/wPaint.css',
        './src/wPaint.js',
        './plugins/file/src/wPaint.menu.main.js',
        './plugins/file/src/wPaint.menu.text.js',
        './plugins/file/src/wPaint.menu.main.shapes.js',
        './plugins/file/src/wPaint.menu.main.file.js'
      ],
      tasks: ['uglify']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['jshint', 'stylus', 'uglify']);
};