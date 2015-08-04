var connect = require('connect');
var serveStatic = require('serve-static');
var port = 8083;

connect().use(serveStatic(__dirname)).listen(port);
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");