define(function(require) {
    var SceneManager = require('SceneManager');

    var Switcher = function() {
        this.model = null;
        this.sceneProperty = '';
    };

    Switcher.prototype.start = function() {
        this.model.on('change:' + this.sceneProperty, setScene, this);
        setScene.call(this);
    };

    function setScene() {
        var switchTo = this.model.getValue(this.sceneProperty);
        if(SceneManager.ActiveScene.id === switchTo) { return; }
        this.sceneSwitched = true;
        SceneManager.startScene(switchTo);
    }

    return Switcher;
});