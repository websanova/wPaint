CanvasRenderingContext2D.prototype.pentagon = function(x, y, width, height) {
  // if values are not set just exit
  if(!x || !y || !width || !height) { return true; }

  this.beginPath();
  this.moveTo(x + width/2, y);
  this.lineTo(x, y + height*0.4);
  this.lineTo(x + width*0.2, y + height);
  this.lineTo(x + width*0.8, y + height);
  this.lineTo(x + width, y + height*0.4);
  this.lineTo(x + width/2, y);
  this.closePath();  
};