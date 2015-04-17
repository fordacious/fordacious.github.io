Planet = (function(DisplayObject) {

	inheritsFrom(Planet, DisplayObject);

	function Planet(src) {
		
		Planet.parentClass.constructor.apply(this, arguments);
		
		this.radius = 50;
		this.planetSurfaceTexture = createImage("./assets/planetSurfaceTexture.png");
		
		this.cometTrail = this.addChild(new DisplayImage("./assets/trail.png"));
		this.cometTrail.visible = false;
		
		this.planetImage = createImage("./assets/planet.png");
		
		this.__defineGetter__ ("width", function () {
			return this.radius * 2 * this.scaleX;
		});
		
		this.__defineGetter__ ("height", function () {
			return this.radius * 2 * this.scaleY * 1.5;
		});

		this.on ("render", function (context) {
			if (this.radius > 0) {
				context.save();
				context.beginPath();
				context.arc(0, 0, this.radius, 0, Math.PI*2, true); 
				context.closePath();
				context.fill();
				context.clip();
				context.drawImage(this.planetSurfaceTexture,-this.planetSurfaceTexture.width / 2,-this.planetSurfaceTexture.height / 2)
				context.restore();
				context.save();
				context.scale (this.radius / 50, this.radius / 50);
				context.globalAlpha *= this.cometTrail.alpha
				context.drawImage(this.cometTrail.image,-this.cometTrail.image.width / 2+ 290,-this.cometTrail.image.height / 2 + 200)
				context.restore();
				context.save()
				context.scale(this.radius/this.planetImage.width * 3, this.radius / this.planetImage.height * 3);
				context.drawImage(this.planetImage,-this.planetImage.width / 2 + 2,-this.planetImage.height / 2 + 1)
				context.restore();
			}
		})
		
	}

	return Planet;

})(DisplayObject);