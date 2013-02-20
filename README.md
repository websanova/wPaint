# wPaint.js

A jQuery paint plugin.

 - [Feature App](http://pixanova.com)
 - [Live Demo](http://www.websanova.com/plugins/paint/html5)


## Settings

Available options with notes, the values here are the defaults.

```javascript
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

Update settings on the fly:

```javascript
$('#elem').wPaint('image', '<image_data>');
$('#elem').wPaint('image', '/path/to/file.jpg');
```

Retrieve settings, if more than one it will return an array otherwise just the value.

```javascript
console.log($('#elem').wPaint('strokeStyle'));            // #FFFF00
console.log($('.elem').wPaint('strokeStyle'));            // ['#FFFF00', '#FFFF00']
```

Retrieve paint object.

```javascript
var wp = $('#wPaint').wPaint().data('_wPaint');
console.log(wp);                                          // {wPaint object}
```


## Methods

```javascript
$('#elem').wPaint('clear');
```


## Examples

Init with image and some callbacks:

```html
<div id="wPaint"></div>
down: <input id="canvasDown" type="text" />
move: <input id="canvasMove" type="text" />
up:   <input id="canvasUp" type="text" />

<script type="text/javascript">
    $("#wPaint").wPaint({
        image: <image_data>,
        drawDown: function(e, mode){ $("#canvasDown").val(this.settings.mode + ": " + e.pageX + ',' + e.pageY); },
        drawMove: function(e, mode){ $("#canvasMove").val(this.settings.mode + ": " + e.pageX + ',' + e.pageY); },
        drawUp: function(e, mode){ $("#canvasUp").val(this.settings.mode + ": " + e.pageX + ',' + e.pageY); }
    });
</script>
```

Init with background (bg is saved with image but cannot be altered):

```html
<div id="wPaint"></div>

<script type="text/javascript">
    $("#wPaint").wPaint({
        image: './some/path/imagepreload.png',
        imageBg: './some/path/imagebg.png'
    });
</script>
```

Set image on the fly:

```html
<div id="wPaint"></div>
    
<script type="text/javascript">
    $("#wPaint").wPaint();

    $('#wPaint').wPaint('image', '<image_data>')
</script>
```

Get image data:

```html
<div id="wPaint"></div>
<img id="canvasImage" src=""/>

<script type="text/javascript">
    var imageData = $("#wPaint").wPaint("image");
            
    $("#canvasImage").attr('src', imageData);
</script>
```


## Resources

* [jQuery Plugin Development Boilerplate](http://www.websanova.com/tutorials/jquery/jquery-plugin-development-boilerplate)
* [The Ultimate Guide to Writing jQuery Plugins](http://www.websanova.com/tutorials/jquery/the-ultimate-guide-to-writing-jquery-plugins)


## License

MIT licensed

Copyright (C) 2011-2012 Websanova http://www.websanova.com