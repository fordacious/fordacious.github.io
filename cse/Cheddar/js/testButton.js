TestButton = (function(Button) {

	inheritsFrom(TestButton, Button);

	function TestButton(src) {
		
		TestButton.parentClass.constructor.apply(this, arguments);
		
		this.moveRight = function () {
			this.x += 1;
		}
	}
	
	TestButton.prototype.moveLeft = function () {
		this.x -= 2;
	}

	return TestButton;

})(Button);