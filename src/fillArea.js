CanvasRenderingContext2D.prototype.fillArea = function(x, y, color) {
  // if values are not set just exit
  if(!x || !y || !color) { return true; }

  // quick way to get formatted rgba color
  var colorTemp = this.canvas.style.color;
  this.canvas.style.color = color;
  color = this.canvas.style.color.match(/^rgba?\((.*)\);?$/)[1].split(',');
  this.canvas.style.color = colorTemp;

  color[0] = parseInt(color[0], 10);
  color[1] = parseInt(color[1], 10);
  color[2] = parseInt(color[2], 10);
  color[3] = parseInt(color[3] || 255, 10);

  function _getPixel(pixelPos) {
    return {r:imageData[pixelPos], g:imageData[pixelPos+1], b:imageData[pixelPos+2], a:imageData[pixelPos+3]};
  }

  function _setPixel(pixelPos) {
    imageData[pixelPos] = color[0];
    imageData[pixelPos+1] = color[1];
    imageData[pixelPos+2] = color[2];
    imageData[pixelPos+3] = color[3];
  }

  function _comparePixel(px2) {
    return (px1.r === px2.r && px1.g === px2.g && px1.b === px2.b && px1.a === px2.a);
  }

  var width = this.canvas.width,
      height = this.canvas.height,
      image = this.getImageData(0, 0, width, height),
      imageData = image.data,
      px1 = _getPixel(((y * width) + x) * 4),
      pixelStack = [[x, y]],
      newPos, pixelPos, reachLeft, reachRight;

  while (pixelStack.length) {
    newPos = pixelStack.pop();

    pixelPos = (newPos[1]*width + newPos[0]) * 4;
    while(newPos[1]-- >= 0 && _comparePixel(_getPixel(pixelPos))) {
      pixelPos -= width * 4;
    }
    
    pixelPos += width * 4;
    ++newPos[1];
    reachLeft = false;
    reachRight = false;
    
    while(newPos[1]++ < height-1 && _comparePixel(_getPixel(pixelPos))) {
      _setPixel(pixelPos);

      if(newPos[0] > 0) {
        if(_comparePixel(_getPixel(pixelPos - 4))) {
          if(!reachLeft) {
            pixelStack.push([newPos[0] - 1, newPos[1]]);
            reachLeft = true;
          }
        }
        else if(reachLeft) {
          reachLeft = false;
        }
      }
    
      if(newPos[0] < width-1) {
        if(_comparePixel(_getPixel(pixelPos + 4))) {
          if(!reachRight) {
            pixelStack.push([newPos[0] + 1, newPos[1]]);
            reachRight = true;
          }
        }
        else if(reachRight) {
          reachRight = false;
        }
      }
        
      pixelPos += width * 4;
    }
  }

  this.putImageData(image, 0, 0);
};