root.pipit = {
BackboneAdapter: require('api/snapshot/adapters/BackboneAdapter').getInstance(),
CapiAdapter: require('api/snapshot/adapters/CapiAdapter').getInstance(),
Controller: require('api/snapshot/Controller'),
noConflict: function() {
    root.pipit = previousPipit;
    return root.pipit;
}
};

}).call(this);
