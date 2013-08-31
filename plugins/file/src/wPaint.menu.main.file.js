(function ($) {
  var img = '/plugins/file/img/icons-menu-main-file.png',
      images = [
      '/test/uploads/wPaint-1.png',
      '/test/uploads/wPaint-2.png',
      '/test/uploads/wPaint-3.png',
      '/test/uploads/wPaint-4.png',
      '/test/uploads/wPaint-5.png',
      '/test/uploads/wPaint-6.png'
    ];

  // extend menu
  $.extend(true, $.fn.wPaint.menus.main.items, {
    save: {
      icon: 'generic',
      title: 'Save Image',
      img: img,
      index: 0,
      callback: function () {
        this.options.saveImg.apply(this, [this.getImage()]);
      }
    },
    loadBg: {
      icon: 'generic',
      group: 'loadImg',
      title: 'Load Image to Foreground',
      img: img,
      index: 2,
      callback: function () {
        this.options.loadImgFg.apply(this, []);
      }
    },
    loadFg: {
      icon: 'generic',
      group: 'loadImg',
      title: 'Load Image to Background',
      img: img,
      index: 1,
      callback: function () {
        this.options.loadImgBg.apply(this, []);
      }
    }  
  });

  // extend defaults
  $.extend($.fn.wPaint.defaults, {
    imageList: [],

    saveImg: function (image) {
      var _this = this;

      $.ajax({
        type: 'POST',
        url: '/test/upload.php',
        data: {image: image},
        success: function (resp) {

          // doesn't have to be json, can be anything
          // returned from server after upload as long
          // as it contains the path to the image url
          // or a base64 encoded png, either will work
          resp = $.parseJSON(resp);

          // update images array / object or whatever
          // is being used to keep track of the images
          images.push(resp.img);
          
          // internal function for displaying status messages in the canvas
          _this._displayStatus('Image saved successfully');
        }
      });
    },

    loadImgFg: function () {

      // generate images array here
      this._showFileModal('fg', images);
    },

    loadImgBg: function () {

      // generate images array here
      this._showFileModal('bg', images);
    }
  });

  // extend functions
  $.fn.wPaint.extend({
    _showFileModal: function (type, images) {
      var _this = this,
          $content = $('<div></div>'),
          $img = null;

      function appendContent(type, image) {
        function imgClick(e) {

          // just in case to not draw on canvas
          e.stopPropagation();
          if (type === 'fg') { _this.setImage(image); }
          else if (type === 'bg') { _this.setBg(image); }
        }

        $img.on('click', imgClick);
      }

      for (var i = 0, ii = images.length; i < ii; i++) {
        $img = $('<img class="wPaint-modal-img"/>').attr('src', images[i]);
        $img = $('<div class="wPaint-modal-img-holder"></div>').append($img);

        (appendContent)(type, images[i]);

        $content.append($img);
      }

      this._showModal($content);
    }
  });
})(jQuery);