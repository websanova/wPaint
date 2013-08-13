CanvasRenderingContext2D.prototype.hexagon = function(x, y, width, height) {
  // if values are not set just exit
  if(!x || !y || !width || !height) { return true; }

	var facShort = 0.225,
  	  facLong = 1 - facShort;

  this.beginPath();
  this.moveTo(x + width*0.5, y);
  this.lineTo(x, y + height*facShort);
  this.lineTo(x, y + height*facLong);
  this.lineTo(x + width*0.5, y + height);
  this.lineTo(x + width, y + height*facLong);
  this.lineTo(x + width, y + height*facShort);
  this.lineTo(x + width*0.5, y);
  this.closePath();  
};