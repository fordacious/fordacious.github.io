var Interlude1 = (function () {
    function Interlude1 () {

        this.displayObjects = [];

        this.add = function (stage) {}
        this.remove = function () {
            // remove all added display objects
            this.displayObjects.forEach(function (displayObject) {
                stage.removeChild(displayObject);
            })
            returnFromInterlude();
        }
        this.i = 0;
        this.colour = '#'+Math.round(Math.random() * 0xFFFFFF).toString(16);
        this.posX = Math.random() * 600;
        this.posY = Math.random() * 600;
        this.update = function (stage) {
            this.i += 1;

            var text = new Text("I feel colder", 'bold 20px Arial', '#333333');
            text.x = 100 + this.posX;
            text.y = 100 + this.posY + this.i / 30;

            stage.addChild(text);
            this.displayObjects.push(text);

            var shape = new Shape();
            shape.graphics.beginFill(this.colour).drawCircle(0, 0, 100 - Math.cos(this.i / 300 * Math.PI / 2) * 100);
            stage.addChild(shape);
            this.displayObjects.push(shape);

            shape.x = this.i * 2 + 30;
            shape.y = 360 + Math.sin(this.i / 100) * 100;

            if (this.i > 300) {
                this.remove();
            }
        }
    }
    return Interlude1;
})();

var Interlude2 = (function () {
    function Interlude1 () {

        this.displayObjects = [];

        this.add = function (stage) {}
        this.remove = function () {
            // remove all added display objects
            this.displayObjects.forEach(function (displayObject) {
                stage.removeChild(displayObject);
            })
            returnFromInterlude();
        }
        this.i = 0;
        this.posX = Math.random() * 600;
        this.posY = Math.random() * 600;
        this.update = function (stage) {
            this.i += 1;

            var text = new Text("I feel colder", 'bold 20px Arial', '#333333');
            text.x = 100 + this.posX;
            text.y = 100 + this.posY + this.i / 30;

            stage.addChild(text);
            this.displayObjects.push(text);

            var colour = '#'+Math.round(Math.random() * 0xFFFFFF).toString(16);
            var posX = Math.random() * 720;
            var posY = Math.random() * 720;

            var shape = new Shape();
            shape.graphics.beginFill(colour).drawCircle(0, 0, 1);
            shape.x = posX + 0;
            shape.y = posY + 0;
            stage.addChild(shape);
            this.displayObjects.push(shape);

            for (var j = 0; j < this.displayObjects.length; j ++) {
                this.displayObjects[j].scaleX += 0.05;
            }

            if (this.i > 300) {
                this.remove();
            }
        }
    }
    return Interlude1;
})();

var interludes = [Interlude1, Interlude2];