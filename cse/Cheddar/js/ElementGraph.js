ElementGraph = (function(DisplayObject) {

	inheritsFrom(ElementGraph, DisplayObject);

	function ElementGraph(src, model) {
		
		ElementGraph.parentClass.constructor.apply(this, arguments);
		
		this.background      = this.addChild(new DisplayImage(createImage(src)));
		this.barPercents     = [100,100,100,100,100,100,100,100,100];
		this.displayPercents = [  0,  0,  0,  0,  0,  0,  0,  0,  0];
		this.displayInertia  = 0.2
		
		this.chartData = new ChartData();
		this.chartData.model = model;
		
		this.running = false;
		
		this.planet;
		
		var barObj = this.addChild(new DisplayObject());
		
		var toolTip = this.addChild(new DisplayObject());
		var tbg = toolTip.addChild(new DisplayImage("assets/textBg.png"));
		var t = toolTip.addChild(new Text("100%"));
		t.fillStyle = "#CCCCCC"
		t.font = '14px TitilliumMaps26L'
		t.reference = t.CENTRE
		t.y = -2
		t.x = -2
		
		this.on ("enterframe", function (e) {
			toolTip.x = Cheddar.mouse.x - this.x
			toolTip.y = Cheddar.mouse.y - this.y
			
			var cd = this.chartData;
			
			this.barPercents = [cd.getHCurPercent(), cd.getHeCurPercent(),cd.getCH4CurPercent(),cd.getNH3CurPercent(),cd.getH2OCurPercent(),
								cd.getN2CurPercent(),cd.getO2CurPercent(),cd.getCO2CurPercent(),cd.getXeCurPercent()]
			var mouse = Cheddar.mouse
			var ihit = -1;
			for (var i=0;i<9; i++) {
				if (toolTip.x + this.width / 2 > 23.35*(i+1) && toolTip.x + this.width / 2 < 23.35*(i+1) + 14.5) {
					ihit = i
				}
			}
			
			if (ihit == -1) {
				toolTip.visible = false;
			} else {
				toolTip.visible = true;
				t.text = (((this.barPercents[ihit] * 10 ) | 0) / 10) +"%"
			}
			if (toolTip.y < -this.height / 2 || toolTip.y > this.height / 2) {
				toolTip.visible = false;
			}
		});
		
		this.onPlay = function () {
			this.running = true;
		}
		
		this.onPause = function () {
			this.running = false;
		}
		
		this.on ("enterframe", function (e) {
			if (this.running) {
				//TODO
				this.planet.cometTrail.alpha = this.chartData.gasLossCoefficient * -100;
				//this.parent.pAtmos.alpha = chartData.gasUnitCoefficient ;
				
				this.chartData.calcPortions();
				
			}
		})
		
		var _this = this
		barObj.on ("render", function (context) {
			for (var i=0; i < 9; i++) {
				_this.displayPercents[i] += (_this.barPercents[i] - _this.displayPercents[i]) * _this.displayInertia
			}
			for (i=0; i< 9;i+=2) {
				context.fillStyle = "rgb(204,204,204)";
				if (_this.barPercents[i] < 0) {
					_this.barPercents[i] = 0
				}
				if (_this.barPercents[i] > 100) {
					_this.barPercents[i] = 100
				}
				if (_this.barPercents[i] > 0 && _this.barPercents[i] <= 100) {
					context.fillRect (23.35* (i + 1)- _this.background.width / 2,118.3 - _this.background.height / 2, 14.5, (-111) / 100 * _this.displayPercents[i]);
				}
			}
			for (i=1; i< 9;i+=2) {
				context.fillStyle = "rgb(153,153,153)";
				if (_this.barPercents[i] < 0) {
					_this.barPercents[i] = 0
				}
				if (_this.barPercents[i] > 100) {
					_this.barPercents[i] = 100
				}
				if (_this.barPercents[i] > 0 && _this.barPercents[i] <= 100) {
					context.fillRect (23.35*(i+1)- _this.background.width / 2, 118.3- _this.background.height / 2, 14.5, (-111) / 100 * _this.displayPercents[i]);
				}
			}
		});
		
		this.reset = function () {
			this.running = false;
			this.chartData.reset();
			this.barPercents = [100,100,100,100,100,100,100,100,100];
			//this.displayPercents = [  0,  0,  0,  0,  0,  0,  0,  0,  0];
			this.planet.cometTrail.alpha = 0;
		}		
	}

	return ElementGraph;

})(DisplayObject);