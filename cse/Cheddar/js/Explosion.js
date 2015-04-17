Explosion = (function(DisplayObject) {

	inheritsFrom(Explosion, DisplayObject);

	function Explosion() {
		
		Explosion.parentClass.constructor.apply(this, arguments);
		
		var explodeBits = [];
		
		for (var i=0; i< 20; i++) {
			var e = this.addChild(new DisplayImage("assets/explosion.png"));
			e.alpha = 0;
			explodeBits.push(e);
		}
		
		var exploding = false;
		
		var spacing = 1;
		
		this.radius = 50;
		
		this.explodeSpeed = 0.1;
		this.fadeSpeed    = 0.01;
		this.alpha = 1
		
		this.explode = function () {
			for (var i=0; i< explodeBits.length; i++) {
				var e = explodeBits[i];
				e.x = Math.random()*this.radius*2 - this.radius;
				e.y = Math.random()*this.radius*2 - this.radius;
				e.alpha = 1;
				e.scaleX = 0;
				e.scaleY = 0;
				e.timer = Math.random()*spacing*i;
			}
			exploding = true;
		}
		
		this.on ("enterframe", function () {
			var allDone = true;
			if (exploding) {
				for (var i=0; i< explodeBits.length; i++) {
					var e = explodeBits[i];
					e.timer -= 1;
					if (e.timer < 0) {
						e.scaleX += this.explodeSpeed
						e.scaleY = e.scaleX
						e.alpha -= this.fadeSpeed;
						if (e.alpha < 0) {
							e.visible = false;
						} else {
							e.visible = true;
						}
						if (e.alpha > 0) {
							allDone = false;
						}
					}
				}
			}
			if (allDone) {
				exploding = false;
			}
		});
		
		this.clear = function () {
			exploding = false;
			for (var i=0; i < explodeBits.length; i ++) {
				explodeBits[i].alpha = 0;
			}
		}
		
	}

	return Explosion;

})(DisplayObject);