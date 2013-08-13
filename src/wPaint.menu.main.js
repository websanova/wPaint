(function($) {
  // extend defaults
  $.extend($.fn.wPaint.defaults, {
    lineWidth:   '3',           // starting line width
    fillStyle:   '#FFFFFF',     // starting fill style
    strokeStyle: '#FFFF00'      // start stroke style
  });

  // setup menu
  $.fn.wPaint.menu.main = {
    img: '/img/icons-menu-main.png',
    items: {
      undo: {title:'Undo', type:'icon', index:0, callback:function(){ this.undo(); }},
      redo: {title:'Redo', type:'icon', index:1, callback:function(){ this.redo(); }},
      clear: {title:'Clear', type:'icon', index:2, callback:function(){ this.clear(); }},
      rectangle: {title:'Rectangle', type:'icon', index:3, callback:function(){ this.setMode('rectangle'); }},
      ellipse: {title:'Ellipse', type:'icon', index:4, callback:function(){ this.setMode('ellipse'); }},
      line: {title:'Line', type:'icon', index:5, callback:function(){ this.setMode('line'); }},
      pencil: {title:'Pencil', type:'icon', index:6, callback:function(){ this.setMode('pencil'); }},
      eraser: {title:'Eraser', type:'icon', index:8, callback:function(){ this.setMode('eraser'); }},
      bucket: {title:'Bucket', type:'icon', index:9, callback:function(){ this.setMode('bucket'); }},
      fillStyle: {title:'Fill Color', type:'colorPicker', callback:function(color){ this.setFillStyle(color); }},
      lineWidth: {title:'Stroke Width', type:'select', value:2, range:[1,2,3,4,5,6,7,8,9,10], callback:function(width){ this.setLineWidth(width); }},
      strokeStyle: {title:'Stroke Color', type:'colorPicker', callback:function(color){ this.setStrokeStyle(color); }}      
    }
  };

  $.extend($.fn.wPaint.cursors, {
    pencil: 'url("/img/cursor-pencil.png") 0 12, default',
    bucket: 'url("/img/cursor-bucket.png") 0 10, default',
    eraser1: 'url("/img/cursor-eraser1.png") 1 1, default',
    eraser2: 'url("/img/cursor-eraser2.png") 2 2, default',
    eraser3: 'url("/img/cursor-eraser3.png") 2 2, default',
    eraser4: 'url("/img/cursor-eraser4.png") 3 3, default',
    eraser5: 'url("/img/cursor-eraser5.png") 3 3, default',
    eraser6: 'url("/img/cursor-eraser6.png") 4 4, default',
    eraser7: 'url("/img/cursor-eraser7.png") 4 4, default',
    eraser8: 'url("/img/cursor-eraser8.png") 5 5 , default',
    eraser9: 'url("/img/cursor-eraser9.png") 5 5, default',
    eraser10: 'url("/img/cursor-eraser10.png") 6 6, default'
  });

  // extend functions
  $.fn.wPaint.extend({
    undoCurrent: -1,
    undoArray: [],
    setUndoFlag: true,

    generate: function() {
      this.menu.all.main = this._createMenu('main', {
        offsetLeft: this.options.menuOffsetLeft,
        offsetTop: this.options.menuOffsetTop
      });
    },

    _init: function() {
      // must add undo on init to set the first undo as the initial drawing (bg or blank)
      this._addUndo();
      this.menu.all.main._setIconDisabled('clear', true);

      this.setStrokeStyle(this.options.strokeStyle);
      this.setLineWidth(this.options.lineWidth);
      this.setFillStyle(this.options.fillStyle);
    },

    setStrokeStyle: function(color) {
      this.options.strokeStyle = color;
      this.menu.all.main._setColorPickerValue('strokeStyle', color);
    },

    setLineWidth: function(width) {
      this.options.lineWidth = width;
      this.menu.all.main._setSelectValue('lineWidth', width);

      // reset cursor here based on mode in case we need to update cursor (for instance when changing cursor for eraser sizes)
      this.setCursor(this.options.mode);
    },

    setFillStyle: function(color) {
      this.options.fillStyle = color;
      this.menu.all.main._setColorPickerValue('fillStyle', color);
    },

    setCursor: function(cursor) {
      if(cursor === 'eraser') {
        this.setCursor('eraser' + this.options.lineWidth);
      }
    },

    /****************************************
     * undo / redo
     ****************************************/
    undo: function() {
      if(this.undoArray[this.undoCurrent-1]) {
        this._setUndo(--this.undoCurrent);
      }

      this._undoToggleIcons();
    },

    redo: function() {
      if(this.undoArray[this.undoCurrent+1]) {
        this._setUndo(++this.undoCurrent);
      }

      this._undoToggleIcons();
    },

    _addUndo: function() {
      //if it's not at the end of the array we need to repalce the current array position
      if(this.undoCurrent < this.undoArray.length-1) {
        this.undoArray[++this.undoCurrent] = this.getImage(false);
      }
      else { // owtherwise we push normally here
        this.undoArray.push(this.getImage(false));

        //if we're at the end of the array we need to slice off the front - in increment required
        if(this.undoArray.length > this.undoMax) {
          this.undoArray = this.undoArray.slice(1, this.undoArray.length);
        }
        //if we're NOT at the end of the array, we just increment
        else{ this.undoCurrent++; }
      }

      //for undo's then a new draw we want to remove everything afterwards - in most cases nothing will happen here
      while(this.undoCurrent != this.undoArray.length-1) { this.undoArray.pop(); }

      this._undoToggleIcons();
      this.menu.all.main._setIconDisabled('clear', false);
    },

    _undoToggleIcons: function() {
      var undoIndex = (this.undoCurrent > 0 && this.undoArray.length > 1) ? 0 : 1,
          redoIndex = (this.undoCurrent < this.undoArray.length-1) ? 2 : 3;

      this.menu.all.main._setIconDisabled('undo', undoIndex === 1 ? true : false);
      this.menu.all.main._setIconDisabled('redo', redoIndex === 3 ? true : false);
    },

    _setUndo: function(undoCurrent) {
      // we don't want to save an undo when calling undo/redo
      this.setUndoFlag = false;
      this.setImage(this.undoArray[undoCurrent]);
    },

    _imageOnload: function() {
      // if setting image directly through api then we will need to call the addUndo
      if(this.setUndoFlag) { this._addUndo(); }
      this.setUndoFlag = true;
    },

    /****************************************
     * clear
     ****************************************/
    clear: function() {
      // only run if not disabled (make sure we only run one clear at a time)
      if(!this.menu.all.main._isIconDisabled('clear')) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this._addUndo();
        this.menu.all.main._setIconDisabled('clear', true);
      }
    },

    /****************************************
     * rectangle
     ****************************************/
    _drawRectangleDown: function(e) { this._drawShapeDown(e); },

    _drawRectangleMove: function(e) {
      this._drawShapeMove(e);

      this.ctxTemp.rect(e.x, e.y, e.w, e.h);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawRectangleUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * ellipse
     ****************************************/
    _drawEllipseDown: function(e) { this._drawShapeDown(e); },

    _drawEllipseMove: function(e) {
      this._drawShapeMove(e);

      this.ctxTemp.ellipse(e.x, e.y, e.w, e.h);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawEllipseUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * line
     ****************************************/
    _drawLineDown: function(e) { this._drawShapeDown(e); },

    _drawLineMove: function(e) {
      this._drawShapeMove(e, 1);

      var xo = this.canvasTempLeftOriginal;
      var yo = this.canvasTempTopOriginal;
      
      if(e.pageX < xo) { e.x = e.x + e.w; e.w = e.w * -1}
      if(e.pageY < yo) { e.y = e.y + e.h; e.h = e.h * -1}
      
      this.ctxTemp.lineJoin = "round";
      this.ctxTemp.beginPath();
      this.ctxTemp.moveTo(e.x, e.y);
      this.ctxTemp.lineTo(e.x + e.w, e.y + e.h);
      this.ctxTemp.closePath();
      this.ctxTemp.stroke();
    },

    _drawLineUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * pencil
     ****************************************/
    _drawPencilDown: function(e) {
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = this.options.strokeStyle;
      this.ctx.fillStyle = this.options.strokeStyle;
      this.ctx.lineWidth = this.options.lineWidth;
      
      //draw single dot in case of a click without a move
      this.ctx.beginPath();
      this.ctx.arc(e.pageX, e.pageY, this.options.lineWidth/2, 0, Math.PI*2, true);
      this.ctx.closePath();
      this.ctx.fill();
      
      //start the path for a drag
      this.ctx.beginPath();
      this.ctx.moveTo(e.pageX, e.pageY);
    },
    
    _drawPencilMove: function(e) {
      this.ctx.lineTo(e.pageX, e.pageY);
      this.ctx.stroke();
    },
    
    _drawPencilUp: function(e) {
      this.ctx.closePath();
      this._addUndo();
    },

    /****************************************
     * eraser
     ****************************************/
    _drawEraserDown: function(e) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'destination-out';
      this._drawPencilDown(e);
    },
    
    _drawEraserMove: function(e) {
      this._drawPencilMove(e);
    },
    
    _drawEraserUp: function(e) {
      this._drawPencilUp(e);
      this.ctx.restore();
    },

    /****************************************
     * bucket
     ****************************************/
    _drawBucketDown: function(e) {
      this.ctx.fillArea(e.pageX, e.pageY, this.options.fillStyle);
    }
  });
})(jQuery);