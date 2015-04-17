function Slider (x,y) {
    this.background = createImage ("assets/slider/back.png");
	this.ball = createImage ("assets/slider/ball.png");
	this.ball2 = createImage ("assets/slider/ball2.png");
	this._value = 0;
	this.value = 0;
	this.minimum = 0;
	this.maximum = 100;
	this.minimum2 = 0;
	this.maximum2 = 100;
	this.dragging = false;
	this.x = x;
	this.y = y;
	this.width = 275;
	this.height = 16;
	this.scaleMap = [[0,0],[0,0],[0,0],[0,0],[0,0]];
	this.scaleX = 1
	this.scaleY = 1
	this.mouseOver = false;
}

Slider.prototype.setValue = function (n) {
	this._value = n
	this.value = this.evalFromSlider(this._value);
}

Slider.prototype.evalFromSlider = function (n) {
	var scaled;

	var evalMax;
	var evalMin;
	var sliderMax;
	var sliderMin;

	var l = this.scaleMap.length;

	for (var i = 1; i < l; i++)	{
		var inner = this.scaleMap[i];
		var slideValue = inner[0];
		//trace (n);
		if (slideValue >= n) {
			//trace ("in evalFromSlider once");
			sliderMax = slideValue;
			sliderMin = this.scaleMap[i - 1][0];
			evalMax = inner[1];
			evalMin = this.scaleMap[i - 1][1];
			break;
		}
	}

	scaled = ((n-sliderMin)/(sliderMax-sliderMin))*(evalMax-evalMin)+evalMin;

	return scaled;
}


Slider.prototype.evalSliderValue = function (n) {
	var sliderValue;

	var evalMax;
	var evalMin;
	var sliderMax;
	var sliderMin;

	var l = this.scaleMap.length;
	for (var i = 1; i < l; i++) {
		var inner = this.scaleMap[i];
		var evalNum = inner[1];

		if (evalNum >= n) {
			evalMax = evalNum;
			evalMin = this.scaleMap[i - 1][1];
			sliderMax = inner[0];
			sliderMin = this.scaleMap[i - 1][0];
			break;
		}
	}

	sliderValue = ((n-evalMin)/(evalMax-evalMin))*(sliderMax-sliderMin)+sliderMin;
	return sliderValue;
}

Slider.prototype.setScaleMap = function (arr) {
	this.scaleMap = arr;
	// extracting the slider minimum and maximum values
	var l = this.scaleMap.length
	this.minimum = this.scaleMap[0][0];
	this.maximum = this.scaleMap[l - 1][0];
	this.minimum2 = this.scaleMap[0][1];
	this.maximum2 = this.scaleMap[l - 1][1];
}

Slider.prototype.fixValues = function () {
	if (this._value < this.minimum) {
		this._value = this.minimum
	}
	if (this._value > this.maximum) {
		this._value = this.maximum;
	}
}

Slider.prototype.draw = function (context) {
	
	if (this._value < this.minimum) {
		this._value = this.minimum;
	}
	if (this._value > this.maximum) {
		this._value = this.maximum;
	}
	
	this.value = this.evalFromSlider(this._value);
	
	context.save()
	context.scale(this.scaleX, this.scaleY)
	
	context.drawImage(this.background,this.x / this.scaleX,this.y / this.scaleY - this.height / 4);
	
	context.restore();
	
	var t = ((230*this.scaleX) / (this.maximum - this.minimum) * (this._value - this.minimum));
	
	if (this.mouseOver == false) {
		context.drawImage(this.ball,this.x + 12*this.scaleX + t, this.y -5*this.scaleY - this.height / 4);
	} else {
		context.drawImage(this.ball2,this.x + 12*this.scaleX + t, this.y -5*this.scaleY- this.height / 4);
	}
	/////////

	for (var i = 0; i < this.scaleMap.length; i++)	{
		var arr = this.scaleMap[i];
		var tickValue = arr[0];
		var xPos = (tickValue/this.maximum)*230 ;
		context.fillStyle = '#ffffff';
		context.fillRect(this.x + xPos * this.scaleX + 20 * this.scaleX,this.y - 5*this.scaleY,3,6);
	}
	
	
	//window.console.log(this.value);
	//////////
}

Slider.prototype.onmousedown = function (e) {
	this.dragging = true;
}

Slider.prototype.onmouseup = function (e) {
	this.dragging = false;
}

Slider.prototype.onmousemove = function (e,mx,omx) {
	if (this.dragging && this.mouseOver) {
	//if (this.mouseOver) {
		this.setValue (this._value + (mx - omx) / (2*this.scaleX))
	}
}

Slider.prototype.onmouseover = function (e) {
}

Slider.prototype.onmouseout = function (e) {
}

Slider.prototype.enterframe = function (e) {
	//do nothing
}