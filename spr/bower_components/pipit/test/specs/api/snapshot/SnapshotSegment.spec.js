define(function(require) {

    var SnapshotSegment = require('api/snapshot/SnapshotSegment');

    describe('SnapshotSegment', function() {

        var snapshot = null;

        beforeEach(function() {
            snapshot = new SnapshotSegment('stage.text1.text.path', 'value');
        });

        it('should remember the fullpath and value', function() {
            expect(snapshot.fullPath).to.be('stage.text1.text.path');
            expect(snapshot.value).to.be('value');
        });

        it('should split the fullpath into a list of subpaths', function() {
            expect(snapshot.path.length).to.be(4);
            expect(snapshot.path[0]).to.be('stage');
            expect(snapshot.path[1]).to.be('text1');
            expect(snapshot.path[2]).to.be('text');
            expect(snapshot.path[3]).to.be('path');
        });

    });

});
