function SplineMethod () {

    //default setting will just draw a straight line
    var hermiteValues = [0, 0, 1, 0];

    this.setResolution = function (value) {
        var resolution = 1 / value;
        hermiteValues = [];
        for (var t = resolution; t <= 1; t += resolution) {
            var h00 = (1 + 2 * t) * (1 - t) * (1 - t);
            var h10 = t  * (1 - t) * (1 - t);
            var h01 = t * t * (3 - 2 * t);
            var h11 = t * t * (t - 1);
            hermiteValues.push(h00, h10, h01, h11);
        }
    };

    this.drawSpline = function (target, segmentStart, segmentEnd, prevSegmentEnd, nextSegmentStart) {
        if (!prevSegmentEnd) {
            prevSegmentEnd = segmentStart;
        }
        if (!nextSegmentStart) {
            nextSegmentStart = segmentEnd;
        }

        var m1 = {x: (segmentEnd.x - prevSegmentEnd.x) / 2, y: (segmentEnd.y - prevSegmentEnd.y) / 2};
        var m2 = {x: (nextSegmentStart.x - segmentStart.x) / 2, y: (nextSegmentStart.y - segmentStart.y) / 2};

        var n = hermiteValues.length;
        for (var i = 0; i < n; i += 4) {
            var h00 = hermiteValues[i];
            var h10 = hermiteValues[i + 1];
            var h01 = hermiteValues[i + 2];
            var h11 = hermiteValues[i + 3];

            var px = h00 * segmentStart.x + h10 * m1.x + h01 * segmentEnd.x + h11 * m2.x;
            var py = h00 * segmentStart.y + h10 * m1.y + h01 * segmentEnd.y + h11 * m2.y;

            target.lineTo(px, py);
        }
    };
}


Game = (function () {

	var width = 800;
	var height = 600;

	var gravity = 1;
	var teapotRotationThreshold = -20;
	var teapotRotationSpeed = 0.5;
	var teapotMaxRotation = -45;
	var teastreamStickyThreshold = 10;
	var groundPoint = 560;
	var teapotY = 40;
	var teacupY = 560;
	var maxTeapotSpeed = 10;
	var splashSize = 10;
	var splashIncrease = 0.2;
	var splashHangTime = 300;
	var steamCreatePercentageChance = 0.07;
	var teadropCupFillAmount = 1 / 500;
	var countdown = 60 * 3;

	var teapotWidth = 200;
	var teapotHeight = 80;
	var teacupWidth = 120;
	var teacupHeight = 140;

	var teaSplashColor = '#423F31';

	function Steam (stage, x, y) {
		this.stage = stage;
		this.fadeSpeed = Math.random() * 0.005 + 0.005;
		this.vy = Math.random() * 0.5 + 0.5;
		var shape = new createjs.Shape();
		var size = Math.random() * 4 - 2 + 15;
		shape.graphics.beginFill(teaSplashColor).drawRect(-size/2, -size/2, size, size);
		shape.rotation = 45;
		this.graphic = new createjs.Container();
		this.graphic.addChild(shape);
		this.graphic.x = x;
		this.graphic.y = y;
		this.graphic.scaleX = 0.1;
		this.stage.addChild(this.graphic);
		this.destroyed = false;
	}

	Steam.prototype.update = function () {
		if (this.destroyed) return;
		if (this.graphic.scaleX < 1) {
			this.graphic.scaleX += this.fadeSpeed;
		}
		this.graphic.y -= this.vy;
		this.graphic.scaleY = this.graphic.scaleX * 2;
		this.graphic.alpha -= this.fadeSpeed;
		if (this.graphic.alpha < 0) {
			this.destroyed = true;
		}
	};

	function createSteam (x, y) {
		return new Steam(this.stage, x, y);
	}

	function Splash (stage, x, y) {
		this.stage = stage;
		this.radius = 0.2;
		this.maxRadius = Math.random() * 10 - 5 + splashSize;
		this.hangTime = 0;
		this.destroyed = false;
		this.graphic = new createjs.Shape();
		this.graphic.graphics.beginFill(teaSplashColor).drawCircle(0, 0, 100);
		this.graphic.x = x;
		this.graphic.y = y;
		this.stage.addChild(this.graphic);
		this.render();
	}

	Splash.prototype.update = function () {
		if (this.destroyed) return;
		if (this.radius < this.maxRadius) {
			this.radius += splashIncrease;
		} else if (this.hangTime >= splashHangTime) {
			this.graphic.alpha -= 0.01;
		}
		this.hangTime += 1;
		if (this.graphic.alpha <= 0) {
			this.stage.removeChild(this.graphic);
			this.destroyed = true;
		}
	};

	Splash.prototype.render = function () {
		this.graphic.scaleY = this.radius / 100;
		this.graphic.scaleX = this.graphic.scaleY * 2.5;
	};

	function TeaDrop (stage, x, y, vx, vy, ax, ay, teacup) {
		this.x = x || 0;
		this.y = y || 0;
		this.vx = vx || 0;
		this.vy = vy || 0;
		this.ax = ax || 0;
		this.ay = ay || 0;
		this.stage = stage;
		this.destroyed = false;
		this.teacup = teacup;

		this.graphic = new createjs.Shape();
		this.graphic.graphics.beginFill(teaSplashColor).drawCircle(0, 0, 5);
		this.stage.addChild(this.graphic);
		this.graphic.alpha = 0;
	}

	TeaDrop.prototype.update = function () {
		if (this.destroyed) return;
		this.vx += this.ax;
		this.vy += this.ay;
		this.x += this.vx;
		this.y += this.vy;
		if (this.y > groundPoint) {
			this.destroyed = true;
			this.stage.removeChild(this.graphic);
			return false;
		}
		this.graphic.x = this.x;
		this.graphic.y = this.y;
		var lipsize = 10;
		if (this.y > teacupY + lipsize * 2 - teacupHeight && this.x > this.teacup.x + lipsize && this.x < this.teacup.x + teacupWidth - lipsize) {
			this.destroyed = true;
			this.stage.removeChild(this.graphic);
			return true;
		}
		if (this.y > teacupY - teacupHeight && this.x > this.teacup.x && this.x < this.teacup.x + lipsize) {
			if (this.y < teacupY - teacupHeight + lipsize * 2) {
				this.vy *= -0.2 - (Math.random() * 0.1 - 0.05);
			} else {
				this.vx = 0;
			}
			if (this.vx > 0) {
				this.vx *= -1;
			}
		} else if (this.y > teacupY - teacupHeight && this.x > this.teacup.x + teacupWidth - lipsize && this.x < this.teacup.x + teacupWidth) {
			if (this.y < teacupY - teacupHeight + lipsize * 2) {
				this.vy *= -0.2 - (Math.random() * 0.1 - 0.05);
			} else {
				this.vx = 0;
			}
			if (this.vx < 0) {
				this.vx *= -1;
			}
		}
		return false;
	};

	function createSplash (x, y) {
		return new Splash(this.stage, x, y);
	}

	function scaleDown (obj, width, height) {
		var bounds = obj.getBounds();
		if (bounds) {
			obj.scaleX = width / bounds.width;
			obj.scaleY = height / bounds.height;
		}
	}

	function createAssets ($canvas, teapotAssetPath, teacupAssetPath, teacupFrontAssetPath) {
		this.context = $canvas.get(0).getContext('2d');
		this.stage = new createjs.Stage(canvas);

		this.teapot = new createjs.Bitmap(teapotAssetPath);
		this.teacup = new createjs.Bitmap(teacupAssetPath);
		this.teacupFront = new createjs.Bitmap(teacupFrontAssetPath);

		this.teapot.x = width / 2 - teapotWidth / 2;

		this.teacupFilledGraphics = new createjs.Shape();
		this.teacupFilledGraphics.graphics.beginFill(teaSplashColor).drawCircle(0, 0, 10);
		this.teacupFilledGraphics.scaleX = 5;
		this.teacupFilledGraphics.scaleY = -1;

		this.teastream = new createjs.Shape();

		this.stage.addChild(this.teapot);
		this.stage.addChild(this.teacup);
		this.stage.addChild(this.teacupFront);
		this.stage.addChild(this.teacupFilledGraphics);
		this.stage.addChild(this.teastream);
	}

	function Game ($canvas, teapotAssetPath, teacupAssetPath, teacupFrontAssetPath) {
		this.mousedown = false;
		this.mousePosition = {x:width / 2, y:height / 2};
		this.teapot = null;
		this.teacup = null;
		this.teacupFront = null;
		this.teadrops = [];
		this.splashes = [];
		this.steamParticles = [];
		createAssets.call(this, $canvas, teapotAssetPath, teacupAssetPath, teacupFrontAssetPath);
		this.$canvas = $canvas;
		this.countdown = countdown;

		this.teacupFilledPercent = 0;

		this.running = true;
		this.endCounter = 0;

		width = $canvas.width();
		height = $canvas.height();
	}
	Game.prototype.update = function () {
		this.$canvas.removeClass('hidden');
		this.countdown -= 1;
		//this.teacup.alpha = 1 - this.countdown / countdown;
		//this.teacupFront.alpha = 1 - this.countdown / countdown;
		//this.teacupFilledGraphics.alpha = 0;
		//this.teapot.alpha = this.teacup.alpha;
		if (this.teacupFilledPercent >= 1) {
			this.mousedown = false;
			this.endgame();
		}

		this.teacup.x = width / 2 - teacupWidth / 2;
		this.teacup.y = teacupY - teacupHeight;
		this.teacupFront.x = width / 2 - teacupWidth / 2;
		this.teacupFront.y = teacupY - teacupHeight;

		this.teapot.y = teapotY;

		if (this.countdown > 0) {
			return;
		}
		this.teacupFilledGraphics.alpha = 1;

		var speed = (this.mousePosition.x - this.teapot.x) / 10;
		speed = Math.min(maxTeapotSpeed, speed);
		speed = Math.max(-maxTeapotSpeed, speed);
		this.teapot.x += speed;
		this.teapot.x = Math.min(width, this.teapot.x);
		this.teapot.x = Math.max(0, this.teapot.x);

		if (this.mousedown) {
			this.teapot.rotation -= teapotRotationSpeed;
			this.teapot.rotation = Math.max(teapotMaxRotation, this.teapot.rotation);
		} else {
			this.teapot.rotation += teapotRotationSpeed * 2;
			this.teapot.rotation = Math.min(0, this.teapot.rotation);
		}
		this.teapot.y = teapotY + Math.sin(this.teapot.rotation / 180 * Math.PI) * -teapotHeight;

		if (this.teapot.rotation < teapotRotationThreshold) {
			var percentTipped = Math.max(0.1, 1 - this.teapot.rotation / teapotMaxRotation);
			var td = new TeaDrop(this.stage, this.teapot.x + 15, this.teapot.y + 5, this.teapot.rotation / 5 + (Math.random() * 0.5 - 0.25) * percentTipped, (Math.random() * 1 - 0.5) * percentTipped, 0, gravity, this.teacup);
			this.teadrops.push(td);
		}

		if (Math.random() < this.teacupFilledPercent * steamCreatePercentageChance) {
			this.steamParticles.push(createSteam.call(this, this.teacup.x + 20 + Math.random() * (teacupWidth - 40), this.teacup.y + 15));
		}
		if (Math.random() < steamCreatePercentageChance) {
			var td = this.teadrops[Math.floor(Math.random() * this.teadrops.length)];
			if (td) {
				this.steamParticles.push(createSteam.call(this, td.x, td.y));
			}
		}
		if (Math.random() < steamCreatePercentageChance) {
			var td = this.splashes[Math.floor(Math.random() * this.splashes.length)];
			if (td) {
				this.steamParticles.push(createSteam.call(this, td.graphic.x, td.graphic.y));
			}
		}

		var _this = this;
		this.teadrops.forEach(function (td) { 
			if (td.update()){
				_this.teacupFilledPercent += teadropCupFillAmount;
				td.x = 10000;
				td.y = 10000;
			}
		});
		this.splashes.forEach(function (splash) { splash.update(); });
		this.steamParticles.forEach(function (steam) { steam.update(); });
		
		var destroyedTeaDrops = this.teadrops.filter(function (td) { return td.destroyed; });
		destroyedTeaDrops.forEach(function (td) {
			_this.splashes.push(createSplash.call(_this, td.x, td.y - 20));
		});

		this.steamParticles = this.steamParticles.filter(function (sp) { return sp.destroyed === false; });
		this.splashes = this.splashes.filter(function (sp) { return sp.destroyed === false; });
		this.teadrops = this.teadrops.filter(function (td) { return td.destroyed === false; });
	};
	function distFromTeapot (a, b) {
		return dist(this.teapot, a) - dist(this.teapot, b);
	}
	Game.prototype.render = function () {
		scaleDown(this.teapot, teapotWidth, teapotHeight);
		scaleDown(this.teacup, teacupWidth, teacupHeight);
		scaleDown(this.teacupFront, teacupWidth, teacupHeight);
		this.stage.setChildIndex( this.teacupFront, this.stage.getNumChildren()-1);

		this.splashes.forEach(function (splash) { splash.render(); });

		//var points = this.teadrops.sort(distFromTeapot.bind(this));
		var points = this.teadrops.reverse();
		var lastIndex = 0;
		var currentIndex = 0;

		this.teastream.graphics.clear();
		// while (currentIndex < points.length - 1) {
		// 	if (dist(points[currentIndex], points[currentIndex + 1]) > teastreamStickyThreshold) {
		// 		renderPoints.call(this, points.slice(lastIndex, currentIndex));
		// 		lastIndex = currentIndex + 1;
		// 	}
		// 	currentIndex += 1;
		// }

		renderPoints.call(this, points.slice(lastIndex, points.length));

		// var sm = new SplineMethod();
		// sm.setResolution(5);

		// var n = points.length;
  //       var i;

  //       this.teastream.graphics.clear();
		// this.teastream.graphics.beginFill(teaSplashColor);
  //       for (i = 0; i < n - 1; i++) {
  //           sm.drawSpline(
  //               this.teastream.graphics, 
  //               points[i], //segment start
  //               points[i + 1], //segment end
  //               points[i - 1], //previous point (may be null)
  //               points[i + 2] //next point (may be null)
  //           );
  //       }
  //       this.teastream.graphics.endFill();

		this.teacupFilledGraphics.x = this.teacup.x + teacupWidth / 2;
		this.teacupFilledGraphics.y = this.teacup.y + teacupHeight / 2 - 40 * this.teacupFilledPercent;

		this.stage.update();
	};
	Game.prototype.endgame = function () {
		this.endCounter += 1;
		if (this.endCounter > countdown * 3) {
			this.endCounter = countdown
			this.running = false;
			this.$canvas.addClass('hidden');
		}
	};

	function renderPoints (points) {
		var ctx = this.teastream.graphics;
		if (points.length > 3) {
			ctx.setStrokeStyle(6, 'round');
			ctx.beginFill(teaSplashColor);
			ctx.moveTo(points[0].x, points[0].y);

			for (i = 1; i < points.length - 2; i ++) {
				var xc = (points[i].x + points[i + 1].x) / 2;
				var yc = (points[i].y + points[i + 1].y) / 2;
				ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
			}
			// curve through the last two points
			ctx.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x,points[i+1].y);

			ctx.endFill();
		} else {
			if (points.length > 0) {
				ctx.beginFill(teaSplashColor);
				ctx.drawCircle(points[0].x, points[0].y,2);
				ctx.endFill();
			}
			if (points.length > 1) {
				ctx.beginFill(teaSplashColor);
				ctx.drawCircle(points[1].x, points[1].y,2);
				ctx.endFill();
			}
			if (points.length > 2) {
				ctx.beginFill(teaSplashColor);
				ctx.drawCircle(points[2].x, points[2].y,2);
				ctx.endFill();
			}
		}
	}

	function dist (a,b) {
		return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	}
	return Game;
})();