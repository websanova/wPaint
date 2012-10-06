# wPaint.js

A jQuery paint plugin. [Check out the live demo](http://www.websanova.com/plugins/paint/html5).


## Settings

Available options with notes, the values here are the defaults.

```javascript
$('input, textarea').wPaint({
    mode                : 'Pencil',         // drawing mode - Rectangle, Ellipse, Line, Pencil, Eraser
    lineWidthMin        : '0',              // line width min for select drop down
    lineWidthMax        : '10',             // line widh max for select drop down
    lineWidth           : '2',              // starting line width
    fillStyle           : '#FFFFFF',        // starting fill style
    strokeStyle         : '#FFFF00',        // start stroke style
    fontSizeMin         : '8',              // min font size in px
    fontSizeMax         : '20',             // max font size in px
    fontSize            : '12',             // current font size for text input
    fontFamilyOptions   : ['Arial', 'Courier', 'Times', 'Trebuchet', 'Verdana'],
    fontFamily          : 'Arial',          // active font family for text input
    fontTypeBold        : false,            // text input bold enable/disable
    fontTypeItalic      : false,            // text input italic enable/disable
    fontTypeUnderline   : false,            // text input italic enable/disable
    image               : null,             // preload image - base64 encoded data
    drawDown            : null,             // function to call when start a draw
    drawMove            : null,             // function to call during a draw
    drawUp              : null              // function to call at end of draw
});
```

Update settings on the fly:

```javascript
$('input').wPaint('image', '<image_data>');
```

Retrieve settings, if more than one it will return an array otherwise just the value.

```javascript
console.log($('#elem').wPaint('strokeStyle'))            // #FFFF00
console.log($('input').wPaint('strokeStyle'))            // ['#FFFF00', '#FFFF00']
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


## License

MIT licensed

Copyright (C) 2011-2012 Websanova http://www.websanova.com