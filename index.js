var fs = require('fs');
var path = require('path');
var async = require('async');

exports.register = function directoryView(plugin, config, next) {
    var servers, engines, templatePath;
    config.log = plugin.log;
    if (!config.url) { config.url = '/'; }
    servers = (config.labels) ? plugin.select(config.labels) : plugin;
    servers.views(config.views);
    engines = Object.keys(config.views.engines);
    if (config.views.path[0] === '/') {
        templatePath = config.views.path;
    } else {
        templatePath = path.join(path.dirname(require.main.filename), config.views.path);
    }

    if (config.index) {
        servers.route({
            method: 'get',
            path: config.url,
            config: {
                handler: function (request, reply) {
                    reply.view(config.index);
                }
            }
        });
    }

    fs.readdir(templatePath, function statFiles(err, files) {
        if (!files) {
            plugin.log(['warning', 'plugin', 'hapi-directory-view'], 'Empty template directory "' + templatePath + '"');
            return next();
        }
        async.each(files, function statFile(file, statDone) {
            fs.stat(path.join(templatePath, file), function addHandler(err, stats) {
                var fileName = file.split('.')[0];
                if (err) { return statDone; }
                if (stats.isFile() && fileName && (fileName !== config.index) && (engines.indexOf(path.extname(file).slice(1)) > -1)) {
                    console.log('routing', config.url + fileName);
                    servers.route({
                        method: 'get',
                        path: config.url + fileName,
                        config: {
                            handler: function (request, reply) {
                                reply.view(fileName);
                            }
                        }
                    });
                } else if (stats.isDirectory()) {
                    plugin.log(['warning', 'plugin', 'hapi-directory-view'], 'Cannot traverse directories, "' + file + '" ignored');
                }
                statDone();
            });
        }, next);
    });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
