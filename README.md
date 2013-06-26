# wPaint.js

A jQuery paint plugin for a simple drawing surface that you can easily pop into your pages, similar to the basic windows paint program.

* [View the wHumanMsg demo](http://whumanmsg.websanova.com)
* [Download the lastest version of wHumanMsg](https://github.com/websanova/wHumanMsg/tags)


## Related Plugins

* [wScratchPad](http://wscratchpad.websanova.com) - Plugin simulating scratch card.
* [wColorPicker](http://wcolorpicker.websanova.com) - Color pallette seleciton plugin.


## Settings

Available options with notes, the values here are the defaults.

```js
$('#elem').wPaint({
    mode                 : 'Pencil',         // drawing mode - Rectangle, Ellipse, Line, Pencil, Eraser
    lineWidthMin         : '0',              // line width min for select drop down
    lineWidthMax         : '10',             // line widh max for select drop down
    lineWidth            : '2',              // starting line width
    fillStyle            : '#FFFFFF',        // starting fill style
    strokeStyle          : '#FFFF00',        // start stroke style
    fontSizeMin          : '8',              // min font size in px
    fontSizeMax          : '20',             // max font size in px
    fontSize             : '12',             // current font size for text input
    fontFamilyOptions    : ['Arial', 'Courier', 'Times', 'Trebuchet', 'Verdana'],
    fontFamily           : 'Arial',          // active font family for text input
    fontTypeBold         : false,            // text input bold enable/disable
    fontTypeItalic       : false,            // text input italic enable/disable
    fontTypeUnderline    : false,            // text input italic enable/disable
    image                : null,             // preload image - base64 encoded data
    imageBg              : null,             // preload image bg, cannot be altered but saved with image
    drawDown             : null,             // function to call when start a draw
    drawMove             : null,             // function to call during a draw
    drawUp               : null,             // function to call at end of draw
    menu                 : ['undo','clear','rectangle','ellipse','line','pencil','text','eraser','fillColor','lineWidth','strokeColor'], // menu items - appear in order they are set
    menuOrientation      : 'horizontal'      // orinetation of menu (horizontal, vertical)
    menuOffsetX          : 5,                // offset for menu (left)
    menuOffsetY          : 5                 // offset for menu (top)
    menuTitles           : {                 // icon titles, replace any of the values to customize
                                'undo': 'undo',
                                'redo': 'redo',
                                'clear': 'clear',
                                'rectangle': 'rectangle',
                                'ellipse': 'ellipse',
                                'line': 'line',
                                'pencil': 'pencil',
                                'text': 'text',
                                'eraser': 'eraser',
                                'fillColor': 'fill color',
                                'lineWidth': 'line width',
                                'strokeColor': 'stroke color',
                                'bold': 'bold',
                                'italic': 'italic',
                                'underline': 'underline',
                                'fontSize': 'font size',
                                'fontFamily': 'font family'
                            },
    disableMobileDefaults: false             // disable default touchmove events for mobile (will prevent flipping between tabs and scrolling)
});
```


## Examples

Include the followin files:

```js
<script type="text/javascript" src="./wPaint.js"></script>
<link rel="Stylesheet" type="text/css" href="./wPaint.css" />
```

### callbacks

```js
$("#elem").wPaint({
    image: <image_data>,
    drawDown: function(e, mode){ console.log(this.settings.mode + ": " + e.pageX + ',' + e.pageY); },
    drawMove: function(e, mode){ console.log(this.settings.mode + ": " + e.pageX + ',' + e.pageY); },
    drawUp: function(e, mode){ console.log(this.settings.mode + ": " + e.pageX + ',' + e.pageY); }
});
```

### background

Init with background (bg is saved with image but cannot be altered):

```js
$("#wPaint").wPaint({
    image: './some/path/imagepreload.png',
    imageBg: './some/path/imagebg.png'
});
```

### image data

Set image on the fly.  Thsi can be a base64 encoded an image or simply a path to any image on the same domain.

```js
$('#wPaint').wPaint('image', '<image_data>')
```

Get the image data:

```js
var imageData = $("#wPaint").wPaint("image");
            
$("#canvasImage").attr('src', imageData);
```

### clear

Clear the canvas manually.

```javascript
$('#elem').wPaint('clear');
```


## Resources

* [More jQuery plugins by Websanova](http://websanova.com/plugins)
* [jQuery Plugin Development Boilerplate](http://wboiler.websanova.com)
* [The Ultimate Guide to Writing jQuery Plugins](http://www.websanova.com/blog/jquery/the-ultimate-guide-to-writing-jquery-plugins)


## License

MIT licensed

Copyright (C) 2011-2012 Websanova http://www.websanova.com