var images = images = [
  '/uploads/wPaint-1.png',
  '/uploads/wPaint-2.png',
  '/uploads/wPaint-3.png',
  '/uploads/wPaint-4.png',
  '/uploads/wPaint-5.png',
  '/uploads/wPaint-6.png'
];

// extend menu
$.extend(true, $.fn.wPaint.menus.main.items, {
  save: {title:'Save Image', icon:'generic', index:0, img:'/img/icons-menu-main-file.png', callback:function(){ this.options.saveImg.apply(this, [this.getImage()]); }},
  loadBg: {title:'Load Image to Foreground', icon:'generic', index:2, group:'loadImg', img:'/img/icons-menu-main-file.png', callback:function(){ this.options.loadImgFg.apply(this, []); }},
  loadFg: {title:'Load Image to Background', icon:'generic', index:1, group:'loadImg', img:'/img/icons-menu-main-file.png', callback:function(){ this.options.loadImgBg.apply(this, []); }}  
});

// extend defaults
$.extend($.fn.wPaint.defaults, {
  imageList: [],

  saveImg: function(image) {
    var _this = this;

    $.ajax({
        type: 'POST',
        url: '/upload.php',
        data: {image:image},
        success: function(resp) {

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

  loadImgFg: function() {

    // generate images array here
    this._showFileModal('fg', images);
  },

  loadImgBg: function() {

    // generate images array here
    this._showFileModal('bg', images);
  }
});

// extend functions
$.fn.wPaint.extend({
    _showFileModal: function(type, images) {
      var _this = this,
          $content = $('<div></div>'),
          $img = null;

      for (var i=0, ii=images.length; i<ii; i++) {
        $img = $('<img class="wPaint-modal-img"/>').attr('src', images[i]);
        $img = $('<div class="wPaint-modal-img-holder"></div>').append($img);

        (appendContent)(type, images[i]);

        $content.append($img);
      }

      this._showModal($content);

      function appendContent(type, image) {
        $img.click(imgclick);

        function imgClick() {

          // just in case to not draw on canvas
          e.stopPropagation();
          if (type === 'fg') { _this.setImage(image); }
          else if (type === 'bg') { _this.setBg(image); }
        }
      }
    }
});

