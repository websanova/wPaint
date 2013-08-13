(function($) {

  $.fn.wPaint.menu.main.items.rectangle.group = 'shapes';
  $.fn.wPaint.menu.main.items.roundedRect = {title:'Rounded Rectangle', type:'icon', index:0, group:'shapes', img:'/img/icons-menu-main-shapes.png', callback:function(){ this.setMode('roundedRect'); }};
  $.fn.wPaint.menu.main.items.square = {title:'Square', type:'icon', index:1, group:'shapes', img:'/img/icons-menu-main-shapes.png', callback:function(){ this.setMode('square'); }};
  $.fn.wPaint.menu.main.items.roundedSquare = {title:'Rounded Square', type:'icon', index:2, group:'shapes', img:'/img/icons-menu-main-shapes.png', callback:function(){ this.setMode('roundedSquare'); }};
  $.fn.wPaint.menu.main.items.diamond = {title:'Diamond', type:'icon', index:4, group:'shapes', img:'/img/icons-menu-main-shapes.png', callback:function(){ this.setMode('diamond'); }};

  $.fn.wPaint.menu.main.items.ellipse.group = 'shapes2';
  $.fn.wPaint.menu.main.items.circle = {title:'Circle', type:'icon', index:3, group:'shapes2', img:'/img/icons-menu-main-shapes.png', callback:function(){ this.setMode('circle'); }};
  $.fn.wPaint.menu.main.items.pentagon = {title:'Pentagon', type:'icon', index:5, group:'shapes2', img:'/img/icons-menu-main-shapes.png', callback:function(){ this.setMode('pentagon'); }};
  $.fn.wPaint.menu.main.items.hexagon = {title:'Hexagon', type:'icon', index:6, group:'shapes2', img:'/img/icons-menu-main-shapes.png', callback:function(){ this.setMode('hexagon'); }};

  // triangle after ellipse
  // star
  // pentagon
  // hexagon
  // trapezoid
  // octagon


  $.fn.wPaint.extend({
    /****************************************
     * roundedRect
     ****************************************/
    _drawRoundedRectDown: function(e) { this._drawShapeDown(e); },

    _drawRoundedRectMove: function(e) {
      this._drawShapeMove(e);

      var radius = e.w > e.h ? e.h/e.w : e.w/e.h;

      this.ctxTemp.roundedRect(e.x, e.y, e.w, e.h, Math.ceil(radius*(e.w*e.h*0.001)));
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawRoundedRectUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * square
     ****************************************/
    _drawSquareDown: function(e) { this._drawShapeDown(e); },

    _drawSquareMove: function(e) {
      this._drawShapeMove(e);

      var l = e.w > e.h ? e.h : e.w;

      this.ctxTemp.rect(e.x, e.y, l, l);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawSquareUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * roundedSquare
     ****************************************/
    _drawRoundedSquareDown: function(e) { this._drawShapeDown(e); },

    _drawRoundedSquareMove: function(e) {
      this._drawShapeMove(e);

      var l = e.w > e.h ? e.h : e.w;

      this.ctxTemp.roundedRect(e.x, e.y, l, l, Math.ceil(l*l*0.001));
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawRoundedSquareUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * diamond
     ****************************************/
    _drawDiamondDown: function(e) { this._drawShapeDown(e); },

    _drawDiamondMove: function(e) {
      this._drawShapeMove(e);

      this.ctxTemp.diamond(e.x, e.y, e.w, e.h);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawDiamondUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * circle
     ****************************************/
    _drawCircleDown: function(e) { this._drawShapeDown(e); },

    _drawCircleMove: function(e) {
      this._drawShapeMove(e);

      var l = e.w > e.h ? e.h : e.w;

      this.ctxTemp.ellipse(e.x, e.y, l, l);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawCircleUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * pentagon
     ****************************************/
    _drawPentagonDown: function(e) { this._drawShapeDown(e); },

    _drawPentagonMove: function(e) {
      this._drawShapeMove(e);

      this.ctxTemp.pentagon(e.x, e.y, e.w, e.h);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawPentagonUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    },

    /****************************************
     * hexagon
     ****************************************/
    _drawHexagonDown: function(e) { this._drawShapeDown(e); },

    _drawHexagonMove: function(e) {
      this._drawShapeMove(e);

      this.ctxTemp.hexagon(e.x, e.y, e.w, e.h);
      this.ctxTemp.stroke();
      this.ctxTemp.fill();
    },

    _drawHexagonUp: function(e) {
      this._drawShapeUp(e);
      this._addUndo();
    }
  });

})(jQuery);