if (window.CanvasRenderingContext2D) {
  CanvasRenderingContext2D.prototype.roundedRect = function(x, y, width, height, radius) {
    // if values are not set just exit
    if(!x || !y || !width || !height) { return true; }

    if (!radius) { radius = 5; }

    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}