(function ($) {

  // setup menu
  $.fn.wPaint.menus.main = {
    img: '/plugins/main/img/icons-menu-main.png',
    items: {
      undo: {
        icon: 'generic',
        title: 'Undo',
        index: 0,
        callback: function () { this.undo(); }
      },
      redo: {
        icon: 'generic',
        title: 'Redo',
        index: 1,
        callback: function () { this.redo(); }
      },
      clear: {
        icon: 'generic',
        title: 'Clear',
        index: 2,
        callback: function () { this.clear(); }
      },
      rectangle: {
        icon: 'activate',
        title: 'Rectangle',
        index: 3,
        callback: function () { this.setMode('rectangle'); }
      },
      ellipse: {
        icon: 'activate',
        title: 'Ellipse',
        index: 4,
        callback: function () { this.setMode('ellipse'); }
      },
      line: {
        icon: 'activate',
        title: 'Line',
        index: 5,
        callback: function () { this.setMode('line'); }
      },
      pencil: {
        icon: 'activate',
        title: 'Pencil',
        index: 6,
        callback: function () { this.setMode('pencil'); }
      },
      eraser: {
        icon: 'activate',
        title: 'Eraser',
        index: 8,
        callback: function () { this.setMode('eraser'); }
      },
      bucket: {
        icon: 'activate',
        title: 'Bucket',
        index: 9,
        callback: function () { this.setMode('bucket'); }
      },
      fillStyle: {
        title: 'Fill Color',
        icon: 'colorPicker',
        callback: function (color) { this.setFillStyle(color); }
      },
      lineWidth: {
        icon: 'select',
        title: 'Stroke Width',
        range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        value: 2,
        callback: function (width) { this.setLineWidth(width); }
      },
      strokeStyle: {
        icon: 'colorPicker',
        title: 'Stroke Color',
        callback: function (color) { this.setStrokeStyle(color); }
      }      
    }
  };

  // extend cursors
  $.extend($.fn.wPaint.cursors, {
    'default': 'url("/plugins/main/img/cursor-crosshair.png") 7 7, default',
    dropper: 'url("/plugins/main/img/cursor-dropper.png") 0 12, default',
    pencil: 'url("/plugins/main/img/cursor-pencil.png") 0 11.99, default',
    bucket: 'url("/plugins/main/img/cursor-bucket.png") 0 10, default',
    eraser1: 'url("/plugins/main/img/cursor-eraser1.png") 1 1, default',
    eraser2: 'url("/plugins/main/img/cursor-eraser2.png") 2 2, default',
    eraser3: 'url("/plugins/main/img/cursor-eraser3.png") 2 2, default',
    eraser4: 'url("/plugins/main/img/cursor-eraser4.png") 3 3, default',
    eraser5: 'url("/plugins/main/img/cursor-eraser5.png") 3 3, default',
    eraser6: 'url("/plugins/main/img/cursor-eraser6.png") 4 4, default',
    eraser7: 'url("/plugins/main/img/cursor-eraser7.png") 4 4, default',
    eraser8: 'url("/plugins/main/img/cursor-eraser8.png") 5 5 , default',
    eraser9: 'url("/plugins/main/img/cursor-eraser9.png") 5 5, default',
    eraser10: 'url("/plugins/main/img/cursor-eraser10.png") 6 6, default'
  });

  // extend defaults
  $.extend($.fn.wPaint.defaults, {
    mode:        'pencil',  // set mode
    lineWidth:   '3',       // starting line width
    fillStyle:   '#FFFFFF', // starting fill style
    strokeStyle: '#FFFF00'  // start stroke style
  });

  // extend functions
  $.fn.wPaint.extend({
    undoCurrent: -1,
    undoArray: [],
    setUndoFlag: true,

    generate: function () {
      this.menus.all.main = this._createMenu('main', {
        offsetLeft: this.options.menuOffsetLeft,
        offsetTop: this.options.menuOffsetTop
      });
    },

    _init: function () {
      // must add undo on init to set the first undo as the initial drawing (bg or blank)
      this._addUndo();
      this.menus.all.main._setIconDisabled('clear', true);
    },

    setStrokeStyle: function (color) {
      this.options.strokeStyle = color;
      this.menus.all.main._setColorPickerValue('strokeStyle', color);
    },

    setLineWidth: function (width) {
      this.options.lineWidth = width;
      this.menus.all.main._setSelectValue('lineWidth', width);

      // reset cursor here based on mode in case we need to update cursor (for instance when changing cursor for eraser sizes)
      this.setCursor(this.options.mode);
    },

    setFillStyle: function (color) {
      this.options.fillStyle = color;
      this.menus.all.main._setColorPickerValue('fillStyle', color);
    },

    setCursor: function (cursor) {
      if (cursor === 'eraser') {
        this.setCursor('eraser' + this.options.lineWidth);
      }
    },

    /****************************************
     * undo / redo
     ****************************************/
    undo: function () {
      if (this.undoArray[this.undoCurrent - 1]) {
        this._setUndo(--this.undoCurrent);
      }

      this._undoToggleIcons();
    },

    redo: function () {
      if (this.undoArray[this.undoCurrent + 1]) {
        this._setUndo(++this.undoCurrent);
      }

      this._undoToggleIcons();
    },

    _addUndo: function () {

      //if it's not at the end of the array we need to repalce the current array position
      if (this.undoCurrent < this.undoArray.length - 1) {
        this.undoArray[++this.undoCurrent] = this.getImage(false);
      }
      else { // owtherwise we push normally here
        this.undoArray.push(this.getImage(false));

        //if we're at the end of the array we need to slice off the front - in increment required
        if (this.undoArray.length > this.undoMax) {
          this.undoArray = this.undoArray.slice(1, this.undoArray.length);
        }
        //if we're NOT at the end of the array, we just increment
        else { this.undoCurrent++; }
      }

      //for undo's then a new draw we want to remove everything afterwards - in most cases nothing will happen here
      while (this.undoCurrent !== this.undoArray.length - 1) { this.undoArray.pop(); }

      this._undoToggleIcons();
      this.menus.all.main._setIconDisabled('clear', false);
    },

    _undoToggleIcons: function () {
      var undoIndex = (this.undoCurrent > 0 && this.undoArray.length > 1) ? 0 : 1,
          redoIndex = (this.undoCurrent < this.undoArray.length - 1) ? 2 : 3;

      this.menus.all.main._setIconDisabled('undo', undoIndex === 1 ? true : false);
      this.menus.all.main._setIconDisabled('redo', redoIndex === 3 ? true : false);
    },

    _setUndo: function (undoCurrent) {

      // we don't want to save an undo when calling undo/redo
      this.setUndoFlag = false;
      this.setImage(this.undoArray[undoCurrent]);
    },

    _imageOnload: function () {

      // if setting image directly through api then we will need to call the addUndo
      if (this.setUndoFlag) { this._addUndo(); }
      this.setUndoFlag = true;
    },

    /****************************************
     * clear
     ****************************************/
    clear: function () {
      // only run if not disabled (make sure we only run one clear at a time)
      if (!this.menus.all.main._isIconDisabled('clear')) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this._addUndo();
        this.menus.all.main._setIconDisabled('clear', true);
      }
    },

    /****************************************
     * rectangle
     ****************************************/
    _drawRectangleDown: function (e) { this._drawShapeDown(e); },

    _drawRectangleMove: function (e) {
      this._drawShapeMove(e);

      this.ctxTemp.rect(e.x, e.y, e.w, e.h);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawRectangleUp: function (e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * ellipse
     ****************************************/
    _drawEllipseDown: function (e) { this._drawShapeDown(e); },

    _drawEllipseMove: function (e) {
      this._drawShapeMove(e);

      this.ctxTemp.ellipse(e.x, e.y, e.w, e.h);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawEllipseUp: function (e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * line
     ****************************************/
    _drawLineDown: function (e) { this._drawShapeDown(e); },

    _drawLineMove: function (e) {
      this._drawShapeMove(e, 1);

      var xo = this.canvasTempLeftOriginal;
      var yo = this.canvasTempTopOriginal;
      
      if (e.pageX < xo) { e.x = e.x + e.w; e.w = e.w * - 1; }
      if (e.pageY < yo) { e.y = e.y + e.h; e.h = e.h * - 1; }
      
      this.ctxTemp.lineJoin = 'round';
      this.ctxTemp.beginPath();
      this.ctxTemp.moveTo(e.x, e.y);
      this.ctxTemp.lineTo(e.x + e.w, e.y + e.h);
      this.ctxTemp.closePath();
      this.ctxTemp.stroke();
    },

    _drawLineUp: function (e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * pencil
     ****************************************/
    _drawPencilDown: function (e) {
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = this.options.strokeStyle;
      this.ctx.fillStyle = this.options.strokeStyle;
      this.ctx.lineWidth = this.options.lineWidth;
      
      //draw single dot in case of a click without a move
      this.ctx.beginPath();
      this.ctx.arc(e.pageX, e.pageY, this.options.lineWidth / 2, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.fill();
      
      //start the path for a drag
      this.ctx.beginPath();
      this.ctx.moveTo(e.pageX, e.pageY);
    },
    
    _drawPencilMove: function (e) {
      this.ctx.lineTo(e.pageX, e.pageY);
      this.ctx.stroke();
    },
    
    _drawPencilUp: function () {
      this.ctx.closePath();
      this._addUndo();
    },

    /****************************************
     * eraser
     ****************************************/
    _drawEraserDown: function (e) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'destination-out';
      this._drawPencilDown(e);
    },
    
    _drawEraserMove: function (e) {
      this._drawPencilMove(e);
    },
    
    _drawEraserUp: function (e) {
      this._drawPencilUp(e);
      this.ctx.restore();
    },

    /****************************************
     * bucket
     ****************************************/
    _drawBucketDown: function (e) {
      this.ctx.fillArea(e.pageX, e.pageY, this.options.fillStyle);
      this._addUndo();
    }
  });
})(jQuery);
