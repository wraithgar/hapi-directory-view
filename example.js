var Hapi = require('hapi');
var Jade = require('jade');
var Good = require('good');
var exampleConfig = {
    url: '/', //URL to serve at
    index: 'home', //Optional filename to serve as index / base of url
    views: {
        engines: {
            jade: Jade
        },
        isCached: false,
        path: './views' //This path is read and served
    }
};

var goodConfig = {
    subscribers: {
        'console': ['ops', 'request', 'log', 'error']
    }
};

var server = new Hapi.Server(3000);

server.pack.register([
    { plugin: require('./'), options: exampleConfig },
    { plugin: Good, options: goodConfig }
], function (err) {
    if (err) { throw err; }
    server.start(function (err) {
        if (err) { throw err; }
        console.log('example running on port', server.info.port);
    });
});
