!(function($) {
   'use strict';

  /************************************************************************
   * Paint class
   ************************************************************************/
  function Paint(el, options) {
      this.$el = $(el);
      this.options = options;
      this.init = false;

      this.menus = {primary:null, active:null, all:{}};
      this.previousMode = null;
      this.width = this.$el.width();
      this.height = this.$el.height();

      this.generate();
      this._init();
  }
  
  Paint.prototype = {
    generate: function() {
      if(this.init) { return this; }

      var _this = this;

      // create canvases
      createCanvas('bg');
      createCanvas('').mousedown(canvasMousedown);
      createCanvas('temp').hide();
      
      // event handlers for drawing
      $(document)
      .mousemove(documentMousemove)
      .mousedown($.proxy(this._closeSelectBoxes, this))
      .mouseup(documentMouseup);

      // automatically appends each canvas
      // also returns the jQuery object so we can chain events right off the function call.
      // for the tempCanvas we will be setting some extra attributes but don't won't matter
      // as they will be reset on mousedown anyway.
      function createCanvas(name) {
        var newName = (name ? name.capitalize() : ''),
            canvasName = 'canvas' + newName,
            ctxName = 'ctx' + newName;

        _this[canvasName] = document.createElement('canvas');
        _this[ctxName] = _this[canvasName].getContext('2d');
        _this['$' + canvasName] = $(_this[canvasName]);
        
        _this['$' + canvasName]
        .attr('class', 'wPaint-canvas' + (name ? '-' + name : ''))
        .attr('width', _this.width + 'px')
        .attr('height', _this.height + 'px')
        .css({position: 'absolute', left: 0, top: 0});

        _this.$el.append(_this['$' + canvasName]);

        return _this['$' + canvasName];
      }

      // event functions
      function canvasMousedown(e) {
        e.preventDefault();
        e.stopPropagation();
        _this.draw = true;
        e.canvasEvent = 'down';
        _this._closeSelectBoxes();
        _this._callShapeFunc.apply(_this, [e]);
      }

      function documentMousemove(e) {
        if (_this.draw) {
          e.canvasEvent = 'move';
          _this._callShapeFunc.apply(_this, [e]);
        }
      }

      function documentMouseup(e) {

        //make sure we are in draw mode otherwise this will fire on any mouse up.
        if (_this.draw) {
          _this.draw = false;
          e.canvasEvent = 'up';
          _this._callShapeFunc.apply(_this, [e]);
        }
      }
    },

    _init: function() {
      var index = null,
          setFuncName = null;

      this.init = true;

      // run any set functions if they exist
      for (index in this.options) {
        setFuncName = 'set' + index.capitalize();
        if (this[setFuncName]) this[setFuncName](this.options[index]);
      }

      this._fixMenus();
      this._bindMobileEvents();

      // initialize active menu button
      this.menus.primary._getIcon(this.options.mode).trigger('click');      
    },

    /************************************
     * setters
     ************************************/
    setTheme: function(theme) {
      //just for menus

      //this.$paint.attr('class', this.$paint.attr('class').replace(/wPaint-theme-.+\s|wPaint-theme-.+$/, ''));
      //this.$paint.addClass('wPaint-theme-' + theme);
    },

    setMode: function(mode) {
      this.setCursor(mode);
      this.previousMode = this.options.mode;
      this.options.mode = mode;
    },

    setImage: function(img, ctx) {
      if (!img) { return true; }

      var _this = this;
      
      ctx = ctx || this.ctx;
      
      if (window.rgbHex(img)) {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = img;
        ctx.rect(0, 0, this.width, this.height);
        ctx.fill();
      }
      else {
        var myImage = new Image();
        myImage.src = img.toString();
        
        $(myImage).load(function() {
          var ratio=1, xR=0, yR=0, x=0, y=0, w=myImage.width, h=myImage.height;

          // get width/height
          if (myImage.width > _this.width || myImage.height > _this.height) {
            xR = _this.width / myImage.width;
            yR = _this.height / myImage.height;

            ratio = xR < yR ? xR : yR;

            w = myImage.width * ratio;
            h = myImage.height * ratio;
          }

          // get left/top (centering)
          x = (_this.width - w) / 2;
          y = (_this.height - h) / 2;

          ctx.clearRect(0, 0, _this.width, _this.height);
          ctx.drawImage(myImage, x, y, w, h);
          if (!ctx) { _this._imageOnload(); }
        });
      }
    },

    setBg: function(img) {
      if (!img) { return true; }
      
      this.setImage(img, this.ctxBg);
    },

    setCursor: function(cursor) {
      this.$el.css('cursor', $.fn.wPaint.cursors[cursor] || $.fn.wPaint.cursors['default']);
    },

    getImage: function(withBg) {
      var canvasSave = document.createElement('canvas'),
          ctxSave = canvasSave.getContext('2d');

      withBg = withBg === false ? false : true;

      $(canvasSave)
      .css({display:'none', position: 'absolute', left: 0, top: 0})
      .attr('width', this.width)
      .attr('height', this.height);

      if (withBg) { ctxSave.drawImage(this.canvasBg, 0, 0); }
      ctxSave.drawImage(this.canvas, 0, 0);

      return canvasSave.toDataURL();
    },

    /************************************
     * prompts
     ************************************/
    _displayStatus: function(msg) {
      var _this = this;

      if(!this.$status) {
        this.$status = $('<div class="wPaint-status"></div>');
        this.$el.append(this.$status);
      }

      this.$status.html(msg);
      clearTimeout(this.displayStatusTimer);

      this.$status.fadeIn(500, function() {
        _this.displayStatusTimer = setTimeout(function() { _this.$status.fadeOut(500); }, 1500);
      });
    },

    _showModal: function($content) {
      if (this.$el.children('.wPaint-modal-bg').length) {
        var _this = this,
        $modal = this.$el.children('.wPaint-modal'),
        $bg = this.$el.children('.wPaint-modal-bg');

        $modal.fadeOut(500, function(){
          $modal.remove();
          $bg.remove();
          _this._createModal($content);
        });
      }
      else {
        this._createModal($content);
      }
    },

    _createModal: function($content) {
      $content = $('<div class="wPaint-modal-content"></div>').append($content.children());

      var _this = this,
          $bg = $('<div class="wPaint-modal-bg"></div>'),
          $modal = $('<div class="wPaint-modal"></div>'),
          $holder = $('<div class="wPaint-modal-holder"></div>'),
          $close = $('<div class="wPaint-modal-close">X</div>');

      $close.click(function(){
        $modal.fadeOut(500, function() {
          $modal.remove();
          $bg.remove();
        });
      });

      $modal.append($holder.append($content)).append($close);
      this.$el.append($bg).append($modal);

      $modal.css({
        left: (this.$el.outerWidth()/2) - ($modal.outerWidth(true)/2),
        top: (this.$el.outerHeight()/2) - ($modal.outerHeight(true)/2)
      });

      $modal.fadeIn(500);
    },

    /************************************
     * menu helpers
     ************************************/
    _createMenu: function(name, options) {
      options = options || {};
      options.alignment = this.options.menuAlignment;
      options.handle = this.options.menuHandle;
      
      return new Menu(this, name, options);
    },

    // TODO: would be nice to do this better way
    // for some reason when setting overflowY:auto with dynamic content makes the width act up
    _fixMenus: function() {
      for (var index in this.menus.all) {
        var $select = this.menus.all[index].$menu.find('.wPaint-menu-select-holder');
        if ($select.length) { $select.children().each(selectEach); }
      }

      function selectEach(){
        var $menu = $(this).clone().appendTo('body');

        if ($menu.outerHeight() === $menu.get(0).scrollHeight) {
          $(this).css({overflowY:'auto'});
        }

        $menu.remove();
      }
    },

    _closeSelectBoxes: function(item) {
      var $selectBoxes = null;

      for (var i in this.menus.all) {
        $selectBoxes = this.menus.all[i].$menuHolder.children('.wPaint-menu-icon-select');

        // hide any open select menus excluding the current menu
        // this is to avoid the double toggle since there are some
        // other events running here
        if (item) { $selectBoxes = $selectBoxes.not('.wPaint-menu-icon-name-' + item.name); }

        $selectBoxes.children('.wPaint-menu-select-holder').hide();
      }
    },

    /************************************
     * events
     ************************************/
    _imageOnload: function() {
      /* a blank helper function for post image load calls on canvas - can be extended by other plugins using the setImage called */
    },

    _bindMobileEvents: function() {
      this.$el.bind('touchstart touchmove touchend touchcancel', function () {
        event.preventDefault();

        var touches = event.changedTouches,
            first = touches[0],
            type = "";

        switch (event.type) {
            case "touchstart": type = "mousedown"; break; 
            case "touchmove": type = "mousemove"; break; 
            case "touchend": type = "mouseup"; break; 
            default: return;
        }

        var simulatedEvent = document.createEvent("MouseEvent"); 

        simulatedEvent.initMouseEvent(
            type, true, true, window, 1, 
            first.screenX, first.screenY, first.clientX, first.clientY, 
            false, false, false, false, 0/*left*/, null
        );

        first.target.dispatchEvent(simulatedEvent);
      });
    },

    _callShapeFunc: function(e) {

      // TODO: this is where issues with mobile offsets are probably off
      var canvasOffset = this.$canvas.offset(),
          canvasEvent = e.canvasEvent.capitalize(),
          func = '_draw' + this.options.mode.capitalize() + canvasEvent;

      // update offsets here since we are detecting mouseup on $(document) not on the canvas
      e.pageX = Math.floor(e.pageX - canvasOffset.left);
      e.pageY = Math.floor(e.pageY - canvasOffset.top);

      // call drawing func
      if(this[func]) { this[func].apply(this, [e]); }

      // run callback if set
      if(this.options['draw' + canvasEvent]) { this.options['_draw' + canvasEvent].apply(this, [e]); }
    },

    _stopPropagation: function(e) {
      e.stopPropagation();
    },

    /************************************
     * shape helpers
     ************************************/
    _drawShapeDown: function(e) {
      this.$canvasTemp
      .css({left: e.PageX, top: e.PageY})
      .attr('width', 0)
      .attr('height', 0)
      .show();

      this.canvasTempLeftOriginal = e.pageX;
      this.canvasTempTopOriginal = e.pageY;
    },
    
    _drawShapeMove: function(e, factor) {
      var xo = this.canvasTempLeftOriginal,
          yo = this.canvasTempTopOriginal;

      // we may need these in other funcs, so we'll just pass them along with the event
      factor = factor || 2;
      e.left = (e.pageX < xo ? e.pageX : xo);
      e.top = (e.pageY < yo ? e.pageY : yo);
      e.width = Math.abs(e.pageX - xo);
      e.height = Math.abs(e.pageY - yo);
      e.x = this.options.lineWidth/2*factor;
      e.y = this.options.lineWidth/2*factor;
      e.w = e.width - this.options.lineWidth*factor;
      e.h = e.height - this.options.lineWidth*factor;

      $(this.canvasTemp)
      .css({left:e.left, top:e.top})
      .attr('width', e.width)
      .attr('height', e.height);
      
      // store these for later to use in our "up" call
      this.canvasTempLeftNew = e.left;
      this.canvasTempTopNew = e.top;

      factor = factor || 2;

      // TODO: set this globally in _drawShapeDown (for some reason colors are being reset due to canvas resize - is there way to permanently set it)
      this.ctxTemp.fillStyle = this.options.fillStyle;
      this.ctxTemp.strokeStyle = this.options.strokeStyle;
      this.ctxTemp.lineWidth = this.options.lineWidth*factor;
    },
    
    _drawShapeUp: function(e) {
      this.ctx.drawImage(this.canvasTemp, this.canvasTempLeftNew, this.canvasTempTopNew);
      this.$canvasTemp.hide();
    },

    /****************************************
     * dropper
     ****************************************/
    _drawDropperDown: function(e) {
      var pos = { x:e.pageX, y:e.pageY },
          pixel = this._getPixel(this.ctx, pos),
          color = null;

      // if we get no color try getting from the background
      //if(pixel.r === 0 && pixel.g === 0 && pixel.b === 0 && pixel.a === 0) {
      //  imageData = this.ctxBg.getImageData(0, 0, this.width, this.height)
      //  pixel = this._getPixel(imageData, pos);
      //}

      color = 'rgba(' + [ pixel.r, pixel.g, pixel.b, pixel.a ].join(',') + ')';

      // set color from dropper here
      this.options[this.dropper] = color;
      this.menus.active._getIcon(this.dropper).wColorPicker('color', color);
    },

    _drawDropperUp: function() {
      this.setMode(this.previousMode);
    },

    // get pixel data represented as RGBa color from pixel array.
    _getPixel: function(ctx, pos) {
      var imageData = ctx.getImageData(0, 0, this.width, this.height),
          pixelArray = imageData.data,
          base = ((pos.y * imageData.width) + pos.x) * 4;
      
      return {
          r : pixelArray[base],
          g : pixelArray[base + 1],
          b : pixelArray[base + 2],
          a : pixelArray[base + 3]
      };
    }
  };

  /************************************************************************
   * Menu class
   ************************************************************************/
  function Menu(wPaint, name, options) {
      this.wPaint = wPaint;
      this.options = options;
      this.name = name;
      this.type = !wPaint.menus.primary ? 'primary' : 'secondary';
      this.docked = true;
      this.dockOffset = {left:0, top:0};

      this.generate();
  }
  
  Menu.prototype = {
    generate: function() {
      this.$menu = $('<div class="wPaint-menu"></div>');
      this.$menuHolder = $('<div class="wPaint-menu-holder wPaint-menu-name-' + this.name + '"></div>');
      
      if (this.options.handle) { this.$menuHandle = this._createHandle(); }
      else { this.$menu.addClass('wPaint-menu-nohandle'); }
      
      if (this.type === 'primary' ) {

        // store the primary menu in primary object - we will need this reference later
        this.wPaint.menus.primary = this;

        this.setOffsetLeft(this.options.offsetLeft);
        this.setOffsetTop(this.options.offsetTop);
      }
      else if(this.type === 'secondary') {
        this.$menu.hide();
      }

      this.$menu.append(this.$menuHolder.append(this.$menuHandle));
      this.reset();
      this.setAlignment(this.options.alignment);
      
      $('body').append(this.$menu);
      this.$menu.width(this.$menu.width());
      this.wPaint.$el.append(this.$menu);

      if(this.type === 'secondary') {
        if(this.options.alignment === 'horizontal') {
          this.dockOffset.top = this.wPaint.menus.primary.$menu.outerHeight(true);
        }
        else {
          this.dockOffset.left = this.wPaint.menus.primary.$menu.outerWidth(true);
        }
      }
    },

    // create / reset menu - will add new entries in the array
    reset: function() {
      var _this = this,
          menu = $.fn.wPaint.menus[this.name];

      for (var i in menu.items) {

        // only add unique (new) items (icons)
        if (!this.$menuHolder.children('.wPaint-menu-icon-name-' + i).length) {
          
          // add the item name, we will need this internally
          menu.items[i].name = i;

          // use default img if img not set
          menu.items[i].img = menu.items[i].img || menu.img;

          // make self invoking to avoid overwrites
          (itemAppend)(menu.items[i]);
        }
      }

      // self invoking function
      function itemAppend(item) { _this._appendItem(item); };
    },

    _appendItem: function(item) {
      var $item = this['_createIcon' + item.icon.capitalize()](item);

      if (item.after) {
        this.$menuHolder.children('.wPaint-menu-icon-name-' + item.after).after($item);
      }
      else {
        this.$menuHolder.append($item);
      }
    },

    /************************************
     * setters
     ************************************/
    setOffsetLeft: function(left) {
      this.$menu.css({left:left});
    },

    setOffsetTop: function(top) {
      this.$menu.css({top:top});
    },

    setAlignment: function(alignment) {
      this.$menu.attr('class', this.$menu.attr('class').replace(/wPaint-menu-alignment-.+\s|wPaint-menu-alignment-.+$/, ''));
      this.$menu.addClass('wPaint-menu-alignment-' + alignment);
    },

    /************************************
     * handle
     ************************************/
    _createHandle: function() {
      var _this = this,
          $handle = $('<div class="wPaint-menu-handle"></div>');

      // the drag/snap events for menus are tricky
      // init handle for ALL menus, primary menu will drag a secondary menu with it, but that is un/binded in the toggle function
      this.$menu.draggable({handle: $handle});

      // if it's a secondary menu we want to check for snapping
      // on drag we set docked to false, on snap we set it back to true
      if (this.type === 'secondary') {
        this.$menu.draggable('option', 'snap', this.wPaint.menus.primary.$menu);
        this.$menu.draggable('option', 'start', draggableStart);
        this.$menu.draggable('option', 'stop', draggableStop);
        this.$menu.draggable('option', 'drag', draggableDrag);
      }

      return $handle;

      // draggable functions
      function draggableStart() {
        _this.docked = false;
        _this._setDrag();
      }

      function draggableStop() {
        $.each(_this.$menu.data('ui-draggable').snapElements, function(i, el){
          var offset = _this.$menu.offset(),
              offsetPrimary = _this.wPaint.menus.primary.$menu.offset();

          _this.dockOffset.left = offset.left - offsetPrimary.left;
          _this.dockOffset.top = offset.top - offsetPrimary.top;
          _this.docked = el.snapping;
        });

        _this._setDrag();
      }

      function draggableDrag() {
        _this._setIndex();
      }
    },

    /************************************
     * generic icon
     ************************************/
    _createIconBase: function(item) {
      var _this = this,
          $icon = $('<div class="wPaint-menu-icon wPaint-menu-icon-name-' + item.name + '"></div>'),
          $iconImg = $('<div class="wPaint-menu-icon-img"></div>'),
          width = $iconImg.realWidth();

      $icon
      .mousedown($.proxy(this.wPaint._closeSelectBoxes, this.wPaint, item))
      .attr('title', item.title)
      .mouseenter(mouseenter)
      .mouseleave(mouseleave)
      .click(click);

      // can have index:0 so be careful here
      if ($.isNumeric(item.index)) {
        $iconImg
        .css({
          backgroundImage: 'url(' + item.img + ')',
          backgroundPosition: (-width*item.index) + 'px 0px'
        });
      }

      return $icon.append($iconImg);

      function mouseenter() {
        var $el = $(this);

        $el.siblings('.hover').removeClass('hover');
        if (!$el.hasClass('disabled')) { $el.addClass('hover'); }
      }

      function mouseleave() {
        $(this).removeClass('hover');
      }

      function click() {
        _this.wPaint.menus.active = _this;
      }
    },

    /************************************
     * icon group
     ************************************/
    _createIconGroup: function(item) {
      var _this = this,
          css = {backgroundImage:'url(' + item.img + ')'},
          $icon = this.$menuHolder.children('.wPaint-menu-icon-group-' + item.group),
          iconExists = $icon.length,
          $selectHolder = null,
          $option = null,
          $item = null,
          width = 0;

      // crate icon if it doesn't exist yet
      if (!iconExists) {
        $icon = this._createIconBase(item)
        .addClass('wPaint-menu-icon-group wPaint-menu-icon-group-' + item.group)
        .bind('click.setIcon', setIconClick)
        .mousedown($.proxy(this._iconClick, this));
      }

      // get the proper width here now that we have the icon
      // this is for the select box group not the main icon
      width = $icon.children('.wPaint-menu-icon-img').realWidth();
      css.backgroundPosition = (-width*item.index) + 'px center';

      // create selectHolder if it doesn't exist
      $selectHolder = $icon.children('.wPaint-menu-select-holder');
      if (!$selectHolder.length) {
        $selectHolder = this._createSelectBox($icon);
        $selectHolder.children().click(selectHolderClick);
      }

      $item = $('<div class="wPaint-menu-icon-select-img"></div>')
      .attr('title', item.title)
      .css(css);

      $option = this._createSelectOption($selectHolder, $item)
      .addClass('wPaint-menu-icon-name-' + item.name)
      .click(optionClick);

      // move select option into place if after is set
      if (item.after) {
        $selectHolder.children('.wPaint-menu-select').children('.wPaint-menu-icon-name-' + item.after).after($option);
      }

      // we only want to return an icon to append on the first run of a group
      if (!iconExists) { return $icon; }

      // local functions
      function setIconClick() {

        // only trigger if menu is not visible otherwise it will fire twice
        // from the mousedown to open the menu which we want just to display the menu
        // not fire the button callback
        if(!$icon.children('.wPaint-menu-select-holder').is(':visible')) {
          item.callback.apply(_this.wPaint, []);
        }
      }

      function selectHolderClick() {
        $icon.addClass('active').siblings('.active').removeClass('active');
      }

      function optionClick() {

        // rebind the main icon when we select an option
        $icon
        .attr('title', item.title)
        .unbind('click.setIcon')
        .bind('click.setIcon', setIconClick);
        
        // run the callback right away when we select an option
        $icon.children('.wPaint-menu-icon-img').css(css);
        item.callback.apply(_this.wPaint, []);
      }
    },

    /************************************
     * icon generic
     ************************************/
    _createIconGeneric: function(item) {

      // just a go between for the iconGeneric type
      return this._createIconActivate(item);
    },

    /************************************
     * icon
     ************************************/
    _createIconActivate: function(item) {

      // since we are piggy backing icon with the item.group
      // we'll just do a redirect and keep the code separate for group icons
      if (item.group) { return this._createIconGroup(item); }

      var _this = this,
          $icon = this._createIconBase(item);

      $icon.click(iconClick);

      return $icon;

      function iconClick(e) {
        if (item.icon !== 'generic') { _this._iconClick(e); }
        item.callback.apply(_this.wPaint, [e]);
      }
    },

    _isIconDisabled: function(name) {
      return this.$menuHolder.children('.wPaint-menu-icon-name-' + name).hasClass('disabled');
    },

    _setIconDisabled: function(name, disabled) {
      var $icon = this.$menuHolder.children('.wPaint-menu-icon-name-' + name);

      if (disabled) {
        $icon.addClass('disabled').removeClass('hover');
      }
      else {
        $icon.removeClass('disabled');
      }
    },

    _getIcon: function(name) {
      return this.$menuHolder.children('.wPaint-menu-icon-name-' + name);
    },

    _iconClick: function(e) {
      var $el = $(e.currentTarget),
          menus = this.wPaint.menus.all;

      // make sure to loop using parent object - don't use .wPaint-menu-secondary otherwise we would hide menu for all canvases
      for (var menu in menus) {
        if (menus[menu] && menus[menu].type === 'secondary') { menus[menu].$menu.hide(); }  
      }

      $el.siblings('.active').removeClass('active');
      if (!$el.hasClass('disabled')) { $el.addClass('active'); }
    },

    /************************************
     * iconToggle
     ************************************/
    _createIconToggle: function(item) {
      var _this = this,
          $icon = this._createIconBase(item);

      $icon.click(iconClick);

      return $icon;

      function iconClick() {
        $icon.toggleClass('active');
        item.callback.apply(_this.wPaint, [$icon.hasClass('active')]);
      }
    },

    /************************************
     * select
     ************************************/
    _createIconSelect: function(item) {
      var _this = this,
          $icon = this._createIconBase(item),
          $selectHolder = this._createSelectBox($icon),
          $option = null;

      // add values for select
      for (var i=0, ii=item.range.length; i<ii; i++) {
        $option = this._createSelectOption($selectHolder, item.range[i]);
        $option.click(optionClick);
        if (item.useRange) { $option.css(item.name, item.range[i]); }
      }

      return $icon;

      function optionClick(e) {
        $icon.children('.wPaint-menu-icon-img').html($(e.currentTarget).html());
        item.callback.apply(_this.wPaint, [$(e.currentTarget).html()]);
      }
    },

    _createSelectBox: function($icon) {
      var _this = this,
          $selectHolder = $('<div class="wPaint-menu-select-holder"></div>'),
          $select = $('<div class="wPaint-menu-select"></div>'),
          timer = null;

      $selectHolder
      .bind('mousedown mouseup', this.wPaint._stopPropagation)
      .click(clickSelectHolder)
      .hide();

      // of hozizontal we'll pop below the icon
      if (this.options.alignment === 'horizontal') {
        $selectHolder.css({left:0, top:$icon.children('.wPaint-menu-icon-img').realHeight('outer', true)});
      }
      // vertical we'll pop to the right
      else {
        $selectHolder.css({left:$icon.children('.wPaint-menu-icon-img').realWidth('outer', true), top:0});
      }

      $icon
      .addClass('wPaint-menu-icon-select')
      .append('<div class="wPaint-menu-icon-group-arrow"></div>')
      .append($selectHolder.append($select));

      // for groups we want to add a delay before the selectBox pops up
      if ($icon.hasClass('wPaint-menu-icon-group')) {
        $icon
        .mousedown(iconMousedown)
        .mouseup(iconMouseup);
      }
      else { $icon.click(iconClick); }

      return $selectHolder;

      function clickSelectHolder(e) {
        e.stopPropagation();
        $selectHolder.hide();
      }

      function iconMousedown() {
        timer = setTimeout(function() { $selectHolder.toggle(); }, 200);
      }

      function iconMouseup() {
        clearTimeout(timer);
      }

      function iconClick() {
        $selectHolder.toggle();
      }
    },

    _createSelectOption: function($selectHolder, value) {
      var $select = $selectHolder.children('.wPaint-menu-select'),
          $option = $('<div class="wPaint-menu-select-option"></div>').append(value);

      // set class for first item to remove any undesired styles like borders
      if (!$select.children().length) { $option.addClass('first'); }

      $select.append($option);

      return $option;
    },

    _setSelectValue: function(icon, value) {
      this._getIcon(icon).children('.wPaint-menu-icon-img').html(value);
    },

    /************************************
     * color picker
     ************************************/
    _createIconColorPicker: function(item) {
      var _this = this,
          $icon = this._createIconBase(item);

      $icon
      .click(iconClick)
      .addClass('wPaint-menu-colorpicker')
      .wColorPicker({
        mode: 'click',
        generateButton: false,
        dropperButton: true,
        onSelect: iconOnSelect,
        onDropper: iconOnDropper
      });

      return $icon;

      function iconClick() {

        // if we happen to click on this while in dropper mode just revert to previous
        if (_this.wPaint.options.mode === 'dropper') { _this.wPaint.setMode(_this.wPaint.previousMode); }
      }

      function iconOnSelect(color) {
        item.callback.apply(_this.wPaint, [color]);
      }

      function iconOnDropper() {
        $icon.trigger('click');
        _this.wPaint.dropper = item.name;
        _this.wPaint.setMode('dropper');
      }
    },

    _setColorPickerValue: function(icon, value) {
      this._getIcon(icon).children('.wPaint-menu-icon-img').css('backgroundColor', value);
    },

    /************************************
     * menu toggle
     ************************************/
    _createIconMenu: function(item) {
      var _this = this,
          $icon = this._createIconActivate(item);

      $icon.click(iconClick);

      return $icon;

      function iconClick() {
        _this.wPaint.setCursor(item.name);

        // the items name here will be the menu name
        var menu = _this.wPaint.menus.all[item.name];
        menu.$menu.toggle();
        menu._setDrag();
      }
    },

    // here we specify which menu will be dragged
    _setDrag: function() {
      var $menu = this.$menu,
          drag = null, stop = null;

      if ($menu.is(':visible')) {
        if (this.docked) {

          // make sure we are setting proper menu object here
          drag = stop = $.proxy(this._setPosition, this);
          this._setPosition();
        }

        // register drag/stop events
        this.wPaint.menus.primary.$menu.draggable('option', 'drag', drag);
        this.wPaint.menus.primary.$menu.draggable('option', 'stop', stop);
      }
    },

    _setPosition: function() {
      var offset = this.wPaint.menus.primary.$menu.position();

      this.$menu.css({
        left: offset.left + this.dockOffset.left,
        top: offset.top + this.dockOffset.top
      });
    },

    _setIndex: function() {
      var primaryOffset = this.wPaint.menus.primary.$menu.offset(),
          secondaryOffset = this.$menu.offset();

      if (
        secondaryOffset.top < primaryOffset.top ||
        secondaryOffset.left < primaryOffset.left
      ) {
        this.$menu.addClass('wPaint-menu-behind');
      }
      else {
        this.$menu.removeClass('wPaint-menu-behind');
      }
    }
  };

  /************************************************************************
   * wPaint
   ************************************************************************/
  $.support.canvas = (document.createElement('canvas')).getContext;

  $.fn.wPaint = function(options, value) {
    if (typeof options === 'string') {
      var values = [], wPaint = null, elements = null, func = null;

      elements = this.each(elOptionsEach);

      if (values.length === 1) { return values[0]; }
      else if (values.length > 0) { return values; }
      else { return elements; }
    }

    options = $.extend({}, $.fn.wPaint.defaults, options);

    return this.each(elCreateEach);

    //-- funcs --//

    function elOptionsEach() {
      wPaint = $(this).data('wPaint');

      if (wPaint) {
        func = (value ? 'set' : 'get') + options.charAt(0).toUpperCase() + options.substring(1).toLowerCase();

        if (wPaint[options]) {
          wPaint[options].apply(wPaint, [value]);
        }
        else if (value) {
          if (wPaint[func]) { wPaint[func].apply(wPaint, [value]); }
          if (wPaint.options[options]) { wPaint.options[options] = value; }
        }
        else {
          if(wPaint[func]) { values.push(wPaint[func].apply(wPaint, [value])); }
          else if (wPaint.options[options]) { values.push(wPaint.options[options]); }
          else { values.push(null); }
        }
      }
    }

    function elCreateEach() {
      if (!$.support.canvas) {
        $(this).html("Browser does not support HTML5 canvas, please upgrade to a more modern browser.");
        return false;
      }

      get(this);
    }

    function get(el) {
      var wPaint = $.data(el, 'wPaint');
      if (!wPaint) {
        var _options = $.extend(true, {}, options);

        _options.lineWidth = parseInt(_options.lineWidth, 10);
        _options.fontSize = parseInt(_options.fontSize, 10);

        wPaint = new Paint(el, _options);
        $.data(el, 'wPaint', wPaint);
      }

      return wPaint;
    }
  };

  /************************************************************************
   * extend
   ************************************************************************/
  $.fn.wPaint.extend = function(funcs, protoType) {
    protoType = protoType === 'menu' ? Menu.prototype : Paint.prototype;

    var func = function(func) {
      if (protoType[func]) {
        var tmpFunc = Paint.prototype[func],
            newFunc = funcs[func];
        
        protoType[func] = function() {
          tmpFunc.apply(this, arguments);
          newFunc.apply(this, arguments);
        };
      }
      else {
        protoType[func] = funcs[func];
      }
    };

    for(var index in funcs) { (func)(index); }
  };

  /************************************************************************
   * Init holders
   ************************************************************************/
  $.fn.wPaint.menus = {};

  $.fn.wPaint.cursors = {
    'default': 'url("/img/cursor-crosshair.png") 7 7, default',
    dropper: 'url("/img/cursor-dropper.png") 0 12, default'
  };

  $.fn.wPaint.defaults = {
    theme:       'classic',     // set theme
    mode:        'pencil',   // set mode
    width: null, // if not set will auto detect
    height: null, // if not set will auto detect
    autoScaleImage: true, // when setting image or imageBg - auto size images to size of canvas.
    autoCenterImage: true, // if true will center image otherwise, goes left/top corner
    menuHandle: true,
    menuAlignment: 'horizontal',
    menuOffsetLeft: 5,
    menuOffsetTop: -50,
    dropperIcon: 'url("/img/icon-dropper.png") 0 12, default'//,
    //bg: '#f0f0f0'
  };
})(jQuery);

/****************************************
 * Additional Utils
 ****************************************/
if(!String.prototype.capitalize) {
  String.prototype.capitalize = function() {
    return this.slice(0,1).toUpperCase() + this.slice(1);
  };
}

(function($) {
  $.fn.realWidth = function(type, margin) {
    var width = null, $div = null, method = null;

    type = type === 'inner' || type === 'outer' ? type : '';
    method = type === '' ? 'width' : type + 'Width';
    margin = margin === true ? true : false;
    $div = $(this).clone().css({position:'absolute', left:-10000}).appendTo('body');
    width = margin ? $div[method](margin) : $div[method]();

    $div.remove();

    return width;
  };

  $.fn.realHeight = function(type, margin) {
    var height = null, $div = null, method = null;

    type = type === 'inner' || type === 'outer' ? type : '';
    method = type === '' ? 'height' : type + 'Height';
    margin = margin === true ? true : false;
    $div = $(this).clone().css({position:'absolute', left:-10000}).appendTo('body');
    height = margin ? $div[method](margin) : $div[method]();

    $div.remove();

    return height;
  };
})(jQuery);