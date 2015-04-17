ScaledSlider = (function (Slider) {

	//extends slider
	inheritsFrom(ScaledSlider, Slider);
	
	function ScaledSlider (src) {
		//call super
		ScaledSlider.parentClass.constructor.call(this, src);
		
		this.scaleMap = [[0,0],[0,0],[0,0],[0,0],[0,0]];
	
		this.__defineGetter__("scaleValue", function () {
			return this.evalFromSlider(this.value);
		});
		this.__defineSetter__("scaleValue", function (x) {
			this.value = this.evalSliderValue(x);
		});
		
		this.on ("enterframe", function (e) {
			this.ball.x *= 0.8
		})
		
		this.on ("render", function (context) {
			//TODO ticks correctly
			for (var i = 0; i < this.scaleMap.length; i++)	{
				var arr = this.scaleMap[i];
				var tickValue = arr[0];
				var xPos = (tickValue/this.maximum)*this.width;
				context.fillStyle = '#ffffff';
				//context.fillRect(xPos * this.scaleX  - 50, - 5*this.scaleY,3,6);
			}
		});
		
		this.setScaleMap = function () {
			
		}
		
		this.evalFromSlider = function (n) {
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
		
		this.evalSliderValue = function (n) {
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
		
		this.setScaleMap = function (arr) {
			this.scaleMap = arr;
			// extracting the slider minimum and maximum values
			var l = this.scaleMap.length
			this.minimum = this.scaleMap[0][0];
			this.maximum = this.scaleMap[l - 1][0];
			this.minimum2 = this.scaleMap[0][1];
			this.maximum2 = this.scaleMap[l - 1][1];
		}
	}
	
	return ScaledSlider
})(Slider)