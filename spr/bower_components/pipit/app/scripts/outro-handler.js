root.pipit = {
SharedSimData: require('api/snapshot/SharedSimData'),
SimCapiHandler: require('api/snapshot/SimCapiHandler'),
SnapshotSegment: require('api/snapshot/SnapshotSegment'),
SimCapiValue: require('api/snapshot/SimCapiValue'),
noConflict: function() {
    root.pipit = previousPipit;
    return root.pipit;
}
};

}).call(this);
