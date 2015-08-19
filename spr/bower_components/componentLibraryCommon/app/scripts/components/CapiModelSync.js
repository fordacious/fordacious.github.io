define(function(require){

    var CapiModelSync = function(){
        this.capi = null;
        this.model = null;
        this.attributes = null;
    };

    CapiModelSync.prototype.start = function(){
        if (!this.attributes) {
            this.attributes = this.capi.keys();
        }
        this.capi.on('change', syncFromCapi, this);
        sync(this.attributes, this.capi, this.model);
        this.model.on('change', syncFromModel, this);
    };

    CapiModelSync.prototype.destroy = function() {
        if (this.capi && this.capi.off)
            this.capi.off('change', syncFromCapi, this);
        if (this.model && this.model.off)
            this.model.off('change', syncFromModel, this);
    };

    var syncFromCapi = function(){
        sync(this.attributes, this.capi, this.model);
    };

    var syncFromModel = function(){
        sync(this.attributes, this.model, this.capi);
    };

    var sync = function (attributes, source, dest) {
        var obj = {};
        for (var i in attributes) {
            obj[attributes[i]] = source.get(attributes[i]);
        }
        dest.set(obj);
    };

    return CapiModelSync;
});