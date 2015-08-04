define(function (require) {
    var $ = require('jquery');
    var _ = require('underscore');

    var ComponentLibrary = require('ComponentLibrary');

    var TemplateModelSync = function () {
        this.renderer = null;
        this.model = null;
        this.attributes = null;
        this.template = null;
    };

    TemplateModelSync.prototype.start = function () {
        this.template = ComponentLibrary.getComponent(this.template);
        this._templateFunction = _.template(this.template);
        this._templateData = {};

        if (!this.attributes) {
            this.attributes = this.model.keys();
        }

        this.model.on("change", render.bind(this));
        render.call(this);
    };

    var render = function () {
        for (var i in this.attributes) {
            this._templateData[this.attributes[i]] = this.model.getValue(this.attributes[i]);
        }
        this.renderer.$el.empty();
        this.renderer.$el.append($(this._templateFunction(this._templateData)));
    };

    return TemplateModelSync;
});