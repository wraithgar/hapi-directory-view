var server;
var Lab = require('lab');
var Hapi = require('hapi');
var Jade = require('jade');
var DirectoryView = require('../');
var lab = exports.lab = Lab.script();

lab.experiment('default tests', function () {
    lab.before(function(done) {
        server = new Hapi.Server(3001);
        server.pack.register([{
            plugin: DirectoryView,
            options: {
                index: 'home',
                views: {
                    engines: {
                        jade: Jade
                    },
                    isCached: false,
                    path: __dirname + '/../views'
                },
                routeConfigs: {
                    swing: {handler: { view: { context: { swing: 'test swing' } } } }
                }
            }
        }], function _packRegistered(err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err.stack, '\n');
                process.exit(1);
            }
            done();
        });
    });
    lab.test('serves template file', function (done) {
        server.inject({
            method: 'get',
            url: '/yard'
        }, function _getYard(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.include('<h3>This is my yard');
            done();
        });
    });
    lab.test('serves index file', function (done) {
        server.inject({
            method: 'get',
            url: '/'
        }, function _getYard(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.include('<h1>Home sweet home');
            done();
        });
    });
    lab.test('serves template context', function (done) {
        server.inject({
            method: 'get',
            url: '/swing'
        }, function _getYard(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.include('<h3>test swing');
            done();
        });
    });
});

lab.experiment('config tests', function () {
    lab.test('url', function (done) {
        server = new Hapi.Server(3001);
        server.pack.register([{
            plugin: DirectoryView,
            options: {
                url: '/test/',
                index: 'home',
                views: {
                    engines: {
                        jade: Jade
                    },
                    isCached: false,
                    path: __dirname + '/../views'
                }
            }
        }], function _packRegistered(err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err.stack, '\n');
                process.exit(1);
            }
            server.inject({
                method: 'get',
                url: '/test/yard'
            }, function _getYard(res) {
                Lab.expect(res.statusCode, 'response code').to.equal(200);
                Lab.expect(res.payload, 'response body').to.include('<h3>This is my yard');
                done();
            });
        });
    });
    lab.test('no index', function (done) {
        server = new Hapi.Server(3001);
        server.pack.register([{
            plugin: DirectoryView,
            options: {
                url: '/',
                views: {
                    engines: {
                        jade: Jade
                    },
                    isCached: false,
                    path: __dirname + '/../views'
                }
            }
        }], function _packRegistered(err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err.stack, '\n');
                process.exit(1);
            }
            server.inject({
                method: 'get',
                url: '/'
            }, function _getYard(res) {
                Lab.expect(res.statusCode, 'response code').to.equal(404);
                done();
            });
        });
    });
});
