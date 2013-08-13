(function($) {
  /************************************************************************
   * Paint class
   ************************************************************************/
  function Paint(el, options) {
      this.$el = $(el);
      this.options = options;
      this.menu = {primary:null, visible:null, all:{}};
      this.icons = {}, // keep track of icons (maybe create icon object for menu here if necessary later on)
      this.init = false;
      this.previousMode = null;
      this.width = this.$el.width();
      this.height = this.$el.height();

      this.generate();
      this._init();
  };
  
  Paint.prototype = {
    generate: function() {
      if(this.init) return this;

      var _this = this;

      // bg canvas
      this.canvasBg = document.createElement('canvas');
      this.ctxBg = this.canvasBg.getContext('2d');
      this.$canvasBg = $(this.canvasBg);
      
      this.$canvasBg
      .attr('class', 'wPaint-canvas-bg')
      .attr('width', this.width + 'px')
      .attr('height', this.height + 'px')
      .css({position: 'absolute', left: 0, top: 0});

      // main canvas and draw handlers
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.$canvas = $(this.canvas);

      this.$canvas
      .attr('class', 'wPaint-canvas')
      .attr('width', this.width + 'px')
      .attr('height', this.height + 'px')
      .css({position: 'absolute', left: 0, top: 0})
      .mousedown(function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this.draw = true;
        e.canvasEvent = 'down';
        _this._callFunc.apply(_this, [e]);
      });
      
      // event handlers for drawing
      $(document)
      .mousemove(function(e) {
        if(_this.draw) {
          e.canvasEvent = 'move';
          _this._callFunc.apply(_this, [e]);
        }
      })
      .mouseup(function(e) {
        //make sure we are in draw mode otherwise this will fire on any mouse up.
        if(_this.draw) {
          _this.draw = false;
          e.canvasEvent = 'up';
          _this._callFunc.apply(_this, [e]);
        }
      });

      // temp canvas for drawing
      this.canvasTemp = document.createElement('canvas');
      this.ctxTemp = this.canvasTemp.getContext('2d');
      this.$canvasTemp = $(this.canvasTemp);
      this.$canvasTemp.css({position: 'absolute'}).hide();
 
      this.$el.append(this.$canvasBg).append(this.$canvas).append(this.$canvasTemp);
    },

    _init: function() {
      this.init = true;

      // initialize active menu button
      this.menu.primary._getIcon(this.options.mode).trigger('click');

      this.setBg(this.options.bg);
      this.setMode(this.options.mode); // defined in menu
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

    setImage: function(data, canvas) {
      var _this = this,
          myImage = new Image(),
          ctx = canvas ? canvas : this.ctx;
      
      myImage.src = data.toString();
      
      $(myImage).load(function() {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.drawImage(myImage, 0, 0);
        if (!canvas) { _this._imageOnload(); }
      });
    },

    setBg: function(img) {
      this.ctxBg.clearRect(0, 0, this.width, this.height);

      // check if img is just a color
      if (window.rgbHex(img)) {
        this.ctxBg.fillStyle = img;
        this.ctxBg.rect(0, 0, this.width, this.height);
        this.ctxBg.fill();
      }
      else {
        this.setImage(img, this.ctxBg);
      }
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
      .attr('width', this.$canvas.attr('width'))
      .attr('height', this.$canvas.attr('height'));

      if (withBg) { ctxSave.drawImage(this.canvasBg, 0, 0); }
      ctxSave.drawImage(this.canvas, 0, 0);

      return canvasSave.toDataURL();
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

    /************************************
     * events
     ************************************/
    _imageOnload: function() {
      /* a blank helper function for post image load calls on canvas - can be extended by other plugins using the setImage called */
    },

    bindMobile: function($el, preventDefault) {
      $el.bind('touchstart touchmove touchend touchcancel', function () {
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
        if(preventDefault) { event.preventDefault(); }
      });
    },

    _callFunc: function(e) {
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
          imageData = this.ctx.getImageData(0, 0, this.width, this.height),
          pixel = this._getPixel(imageData, pos),
          color = null;

      // if we get no color try getting from the background
      //if(pixel.r === 0 && pixel.g === 0 && pixel.b === 0 && pixel.a === 0) {
      //  imageData = this.ctxBg.getImageData(0, 0, this.width, this.height)
      //  pixel = this._getPixel(imageData, pos);
      //}

      color = 'rgba(' + [ pixel.r, pixel.g, pixel.b, pixel.a ].join(',') + ')';

      // set stroke or fill color here??
      this.options[this.dropper] = color;
      this.menu.all[this.icons[this.dropper].menu]._getIcon(this.dropper).wColorPicker('color', color);
    },

    _drawDropperUp: function() {
      this.setMode(this.previousMode);
    },

    // get pixel data represented as RGBa color from pixel array.
    _getPixel: function(imageData, pos) {
      var pixelArray = imageData.data,
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
      this.type = !$('.wPaint-menu').length ? 'primary' : 'secondary';
      this.docked = true;
      this.dockOffset = {left:0, top:0};

      this.generate();
  };
  
  Menu.prototype = {
    generate: function() {
      this.$menu = $('<div class="wPaint-menu"></div>');
      this.$menuHolder = $('<div class="wPaint-menu-holder wPaint-menu-name-' + this.name + '"></div>');
      
      if (this.options.handle) { this.$menuHandle = this._createHandle(); }
      else { this.$menu.addClass('wPaint-menu-nohandle'); }
      
      if (this.type === 'primary' ) {
        // store the primary menu in primary object - we will need this reference later
        this.wPaint.menu.primary = this;

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
          this.dockOffset.top = this.wPaint.menu.primary.$menu.outerHeight(true);
        }
        else {
          this.dockOffset.left = this.wPaint.menu.primary.$menu.outerWidth(true);
        }
      }
    },

    // create / reset menu - will add new entries in the array
    reset: function() {
      var _this = this,
          menu = $.fn.wPaint.menu[this.name];

      for (var i in menu.items) {
        // only add unique (new) items (icons)
        if (!this.$menuHolder.children('.wPaint-menu-icon-name-' + i).length) {
          // add the item name, we will need this internally
          menu.items[i].name = i;

          // use default img if img not set
          menu.items[i].img = menu.items[i].img || menu.img;

          // make self invoking to avoid overwrites
          (function(item) { _this._appendItem(item); })(menu.items[i]);
        }
      }
    },

    _appendItem: function(item) {
      var $item = this['_create' + item.type.capitalize()](item);

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
        this.$menu.draggable('option', 'snap', this.wPaint.menu.primary.$menu);

        this.$menu.draggable('option', 'start', function() {
          _this.docked = false;
          _this._setDrag();
        });

        this.$menu.draggable('option', 'stop', function() {
          $.each(_this.$menu.data('draggable').snapElements, function(i, el){
            var offset = _this.$menu.offset();
                offsetPrimary = _this.wPaint.menu.primary.$menu.offset();

            _this.dockOffset.left = offset.left - offsetPrimary.left;
            _this.dockOffset.top = offset.top - offsetPrimary.top;
            _this.docked = el.snapping;
          });

          _this._setDrag();
        });

        this.$menu.draggable('option', 'drag', function() { _this._setIndex(); });
      }

      return $handle;
    },

    /************************************
     * generic icon
     ************************************/
    _createGenericIcon: function(item) {
      var _this = this,
          $icon = $('<div class="wPaint-menu-icon wPaint-menu-icon-name-' + item.name + '"></div>'),
          $iconImg = $('<div class="wPaint-menu-icon-img"></div>'),
          width = $iconImg.width();

      $icon
      .click(function(){
        // hide any open select menus excluding the current menu - this is to avoid the double toggle since there are some other events running here
        for(var i in _this.wPaint.menu.all) {
          _this.wPaint.menu.all[i].$menuHolder.children('.wPaint-menu-icon-select').not('.wPaint-menu-icon-name-' + item.name).children('.wPaint-menu-select-holder').hide();
        }
      })
      .attr('title', item.title)
      .mouseenter($.proxy(this._iconMouseenter, this))
      .mouseleave($.proxy(this._iconMouseleave, this));

      // can have index:0 so be careful here
      if ($.isNumeric(item.index)) {
        $iconImg
        .css({
          backgroundImage: 'url(' + item.img + ')',
          backgroundPosition: '-' + (item.index*width) + 'px 0px'
        });
      }

      // register the icons menu
      this.wPaint.icons[item.name] = {menu:this.name};

      return $icon.append($iconImg);
    },

    /************************************
     * group icon
     ************************************/
    _createGroupIcon: function(item) {
      var _this = this,
          css = {backgroundImage:'url(' + item.img + ')', backgroundPosition:(-18*item.index) + 'px center'},
          $icon = this.$menuHolder.children('.wPaint-menu-icon-group-' + item.group),
          iconExists = $icon.length,
          $selectHolder = null,
          $option = null,
          $item = null,

          func = function(e) {
            _this._iconClick(e);
            item.callback.apply(_this.wPaint, []);
          };

      // crate icon if it doesn't exist yet
      if (!iconExists) {
        $icon = this._createGenericIcon(item)
        .addClass('wPaint-menu-icon-group wPaint-menu-icon-group-' + item.group)
        .append('<div class="wPaint-menu-icon-group-arrow"></div>')
        .click(func);
      }

      // create selectHolder if it doesn't exist
      $selectHolder = $icon.children('.wPaint-menu-select-holder');
      if (!$selectHolder.length) {
        $selectHolder = this._createSelectBox($icon);
      }

      $item = $('<div class="wPaint-menu-icon-select-img"></div>')
      .attr('title', item.title)
      .css(css);

      $option = this._createSelectOption($selectHolder, $item)
      .addClass('wPaint-menu-icon-name-' + item.name)
      .click(function(e) {
        // rebind the main icon when we select an option
        $icon
        .attr('title', item.title)
        .unbind('click.setIcon')
        .bind('click.setIcon', func)
        
        // run the callback right away when we select an option
        $icon.children('.wPaint-menu-icon-img').css(css);
        item.callback.apply(_this.wPaint, []);
      });

      // move select option into place if after is set
      if (item.after) {
        $selectHolder.children('.wPaint-menu-select').children('.wPaint-menu-icon-name-' + item.after).after($option);
      }

      // we only want to return an icon to append on the first run of a group
      if (!iconExists) { return $icon; }
    },

    /************************************
     * icon
     ************************************/
    _createIcon: function(item) {
      // since we are piggy backing icon with the item.group
      // we'll just do a redirect and keep the code separate for group icons
      if (item.group) { return this._createGroupIcon(item); }

      var _this = this,
          $icon = this._createGenericIcon(item);

      $icon.click(function(e) {
        _this._iconClick(e);
        item.callback.apply(_this.wPaint, [e]);
      });

      return $icon;
    },

    _isIconDisabled: function(name) {
      return this.$menuHolder.children('.wPaint-menu-icon-name-' + name).hasClass('disabled');
    },

    _setIconDisabled: function(name, disabled) {
      var $icon = this.$menuHolder.children('.wPaint-menu-icon-name-' + name);

      if (disabled) {
        $icon.addClass('disabled');
        $icon.removeClass('active hover');
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
          menus = this.wPaint.menu.all;

      // make sure to loop using parent object - don't use .wPaint-menu-secondary otherwise we would hide menu for all canvases
      for (var menu in menus) {
        if (menus[menu] && menus[menu].type === 'secondary') { menus[menu].$menu.hide(); }  
      }

      // set our visible menu to null, if we click on another menu button, it will get set in toggle function
      this.wPaint.menu.visible = null;

      $el.siblings('.active').removeClass('active');
      if (!$el.hasClass('disabled')) { $el.addClass('active'); }
    },

    _iconMouseenter: function(e) {
      var $el = $(e.currentTarget);

      $(e.currentTarget).siblings('.hover').removeClass('hover');
      if (!$el.hasClass('disabled')) { $(e.currentTarget).addClass('hover'); }
    },

    _iconMouseleave: function(e) {
      $(e.currentTarget).removeClass('hover');
    },

    _setColorPickerValue: function(icon, value) {
      this._getIcon(icon).children('.wPaint-menu-icon-img').css('backgroundColor', value);
    },

    /************************************
     * select
     ************************************/
    _createSelect: function(item) {
      var _this = this,
          $icon = this._createGenericIcon(item),
          $selectHolder = this._createSelectBox($icon),
          $option = null;

      // add values for select
      for (var i=0, ii=item.range.length; i<ii; i++) {
        $option = this._createSelectOption($selectHolder, item.range[i]);
        
        $option.click(function() {
          $icon.children('.wPaint-menu-icon-img').html($(this).html());
          item.callback.apply(_this.wPaint, [$(this).html()]);
        });

        if (item.useRange) { $option.css(item.name, item.range[i]); }
      }

      return $icon;
    },

    _createSelectBox: function($icon) {
      var $selectHolder = $('<div class="wPaint-menu-select-holder"></div>'),
          $select = $('<div class="wPaint-menu-select"></div>'),
          timer = null;

      $selectHolder
      .hide()
      .click(function(e){
        e.stopPropagation();
        $selectHolder.hide();
      });

      // of hozizontal we'll pop below the icon
      if (this.options.alignment === 'horizontal') {
        $selectHolder.css({left:0, top:$icon.children('.wPaint-menu-icon-img').outerHeight(true)});
      }
      // vertical we'll pop to the right
      else {
        $selectHolder.css({left:$icon.children('.wPaint-menu-icon-img').outerWidth(true), top:0});
      }

      $icon
      .addClass('wPaint-menu-icon-select')
      .append($selectHolder.append($select));

      // for groups we want to add a delay before the selectBox pops up
      if ($icon.hasClass('wPaint-menu-icon-group')) {
        $icon
        .mousedown(function(){ timer = setTimeout(function(){ $selectHolder.toggle(); }, 400); })
        .mouseup(function(){ clearTimeout(timer); });
      }
      else {
        $icon.click(function(){ $selectHolder.toggle(); });
      }

      return $selectHolder;
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
    _createColorPicker: function(item) {
      var _this = this,
          $icon = this._createGenericIcon(item);

      $icon
      .click(function() {
        // if we happen to click on this while in dropper mode just revert to previous
        if (_this.wPaint.options.mode === 'dropper') { _this.wPaint.setMode(_this.wPaint.previousMode); }
      })
      .addClass('wPaint-menu-colorpicker')
      .wColorPicker({
        mode: 'click',
        generateButton: false,
        onSelect: function(color) {
          item.callback.apply(_this.wPaint, [color]);
        },
        dropperButton: true,
        onDropper: function() {
          $icon.trigger('click');
          _this.wPaint.dropper = item.name;
          _this.wPaint.setMode('dropper');
        }
      });

      return $icon;
    },

    /************************************
     * menu toggle
     ************************************/
    _createMenuToggle: function(item) {
      var _this = this,
          $icon = this._createIcon(item);

      $icon.click(function() {
        _this.wPaint.setCursor(item.name);

        // the items name here will be the menu name
        var menu = _this.wPaint.menu.all[item.name];
        menu.$menu.toggle();
        menu._setDrag();
      });

      return $icon;
    },

    // here we specify which menu will be dragged
    _setDrag: function() {
      var $menu = this.$menu,
          drag = null, stop = null;

      if ($menu.is(':visible')) {
        this.wPaint.menu.visible = this;

        if (this.docked) {
          // make sure we are setting proper menu object here
          drag = stop = $.proxy(this._setPosition, this);
          this._setPosition();
        }

        // register drag/stop events
        this.wPaint.menu.primary.$menu.draggable('option', 'drag', drag);
        this.wPaint.menu.primary.$menu.draggable('option', 'stop', stop);
      }
    },

    _setPosition: function() {
      var offset = this.wPaint.menu.primary.$menu.position();

      this.$menu.css({
        left: offset.left + this.dockOffset.left,
        top: offset.top + this.dockOffset.top
      });
    },

    _setIndex: function() {
      var primaryOffset = this.wPaint.menu.primary.$menu.offset(),
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

      elements = this.each(function() {
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
      });

      if (values.length === 1) { return values[0]; }
      else if (values.length > 0) { return values; }
      else { return elements; }
    }

    options = $.extend({}, $.fn.wPaint.defaults, options);

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

    return this.each(function() {
      if (!$.support.canvas) {
        $(this).html("Browser does not support HTML5 canvas, please upgrade to a more modern browser.");
        return false;
      }

      get(this);
    });
  };

  /************************************************************************
   * menus - store menu objects here
   ************************************************************************/
  $.fn.wPaint.menu = {};

  /************************************************************************
   * cursors
   ************************************************************************/
  $.fn.wPaint.cursors = {
    default: 'url("/img/cursor-crosshair.png") 7 7, default',
    dropper: 'url("/img/cursor-dropper.png") 0 12, default'
  };

  /************************************************************************
   * extend
   ************************************************************************/
  $.fn.wPaint.extend = function(funcs) {
    for(func in funcs) {
      (function(func) {
        if(Paint.prototype[func]) {
          var tmpFunc = Paint.prototype[func],
              newFunc = funcs[func];
          
          Paint.prototype[func] = function() {
            tmpFunc.apply(this, arguments);
            newFunc.apply(this, arguments);
          }
        }
        else {
          Paint.prototype[func] = funcs[func];
        }
      })(func);
    }
  };

  /************************************************************************
   * defaults
   ************************************************************************/  
  $.fn.wPaint.defaults = {
    theme:       'classic',     // set theme
    mode:        'pencil',   // set mode
    width: null, // if not set will auto detect
    height: null, // if not set will auto detect
    menuHandle: true,
    menuAlignment: 'horizontal',
    menuOffsetLeft: 5,
    menuOffsetTop: -35,
    dropperIcon: 'url("/img/icon-dropper.png") 0 12, default',
    bg: '#336633'
  };
})(jQuery);

/****************************************
 * Additional Utils
 ****************************************/
if(!String.prototype.capitalize) {
    Object.defineProperty(String.prototype, 'capitalize', {
        value: function() {
            return this.slice(0,1).toUpperCase() + this.slice(1);
        },
        enumerable: false
    });
}