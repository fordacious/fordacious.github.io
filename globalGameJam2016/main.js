var teapotAsset = "assets/teapot.png";
var teacupAsset = "assets/teacup.png";
var teacupFrontAsset = "assets/teacupfront.png";

function main ($container, $playbutton, $endtext) {
	// TODO touch controls
	// TODO different levels
		// TODO first 3 are designed, rest are procedurally generated
	$(window).one('click', function () {
		$playbutton.addClass('hidden');
		runGame($container, $endtext);
	});
}

function runGame ($container, $endtext) {

	$container.addClass('running');

	var game = new Game($container, teapotAsset, teacupAsset, teacupFrontAsset);
	game.$endtext = $endtext;

	$container.on('mousemove', on_mousemove.bind(game));
	$container.on('mousedown', on_mousedown.bind(game));
	$container.on('mouseup', on_mouseup.bind(game));

	window.requestAnimationFrame(update.bind(game));
}

function update () {
	this.update();
	this.render();
	if (this.running) {
		window.requestAnimationFrame(update.bind(this));
	} else {
		this.$endtext.removeClass('hidden');
	}
}

function on_mousemove (event) {
	var offset = $(event.target).offset();
	this.mousePosition.x = event.pageX - offset.left + 0.5;
	this.mousePosition.y = event.pageY - offset.top + 0.5;
}
function on_mousedown () {
	this.mousedown = true;
}
function on_mouseup () {
	this.mousedown = false;
}