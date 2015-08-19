define(['check'], function(check) {

    var SnapshotSegment = function(fullPath, value) {
        check(fullPath).isString();

        this.fullPath = fullPath;
        this.value = value;
        this.path = [];

        // split the full path into an array of paths
        var start = -1;
        do {
            var end = fullPath.indexOf('.', start + 1);

            if (end !== -1) {
                this.path.push(fullPath.substring(start, end));
            } else {
                this.path.push(fullPath.substring(start));
            }

            start = end + 1;
        } while (start !== 0);
    };

    return SnapshotSegment;
});
