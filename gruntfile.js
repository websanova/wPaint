module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        globals: {
          'window': true,
          'jQuery': true,
          'document': true
        }
      },
      files: {
        src: ['./src/wPaint.js']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      my_target: {
        files: {
          './wPaint.min.js': ['./src/wPaint.js']
        }
      }
    },
    stylus: {
      compile: {
        options: {
          import: ['nib', '../assets/mixins'],
        },
        files: {
          './wPaint.min.css': './src/wPaint.css'
        }
      }
    },
    watch: {
      files: ['./src/wPaint.js', './src/wPaint.css'],
      tasks: ['stylus', 'jshint', 'uglify', 'concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [ 'stylus', 'jshint', 'uglify' ]);
};