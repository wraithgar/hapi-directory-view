var fs = require('fs');
var path = require('path');
var async = require('async');

exports.register = function directoryView(plugin, pluginConfig, next) {
    var servers, engines, templatePath;

    //Allow any predefined things to remain, set view only if not explicitly set for this file
    function makeConfig(fileName, routeConfig) {
        routeConfig = routeConfig || {};
        routeConfig.handler = routeConfig.handler || {};
        routeConfig.handler.view = routeConfig.handler.view || {};
        routeConfig.handler.view.template = routeConfig.handler.view.template || fileName;
        return routeConfig;
    }

    pluginConfig.log = plugin.log;
    if (!pluginConfig.routeConfigs) {
        pluginConfig.routeConfigs = {};
    }
    if (!pluginConfig.url) { pluginConfig.url = ''; }
    if (pluginConfig.url.slice(-1) === '/') { pluginConfig.url = pluginConfig.url.slice(0, -1); }
    servers = (pluginConfig.labels) ? plugin.select(pluginConfig.labels) : plugin;
    servers.views(pluginConfig.views);
    engines = Object.keys(pluginConfig.views.engines);
    if (pluginConfig.views.path[0] === '/') {
        templatePath = pluginConfig.views.path;
    } else {
        templatePath = path.join(path.dirname(require.main.filename), pluginConfig.views.path);
    }

    if (pluginConfig.index) {
        servers.route({
            method: 'get',
            path: pluginConfig.url + '/',
            config: makeConfig(pluginConfig.index, pluginConfig.routeConfigs[pluginConfig.index])
        });
    }

    fs.readdir(templatePath, function statFiles(err, files) {
        if (!files) {
            plugin.log(['warning', 'plugin', 'hapi-directory-view'], 'Empty template directory "' + templatePath + '"');
            return next();
        }
        async.each(files, function statFile(file, statDone) {
            fs.stat(path.join(templatePath, file), function addHandler(err, stats) {
                if (err) { return statDone; }
                var fileName = file.split('.')[0];
                if (stats.isFile() && fileName && (fileName !== pluginConfig.index) && (engines.indexOf(path.extname(file).slice(1)) > -1)) {
                    servers.route({
                        method: 'get',
                        path: pluginConfig.url + '/' + fileName,
                        config: makeConfig(fileName, pluginConfig.routeConfigs[fileName])
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
