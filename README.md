# hapi-directory-view

Serve up an entire directory of templates in hapi


## Use

```javascript
var Hapi = require('hapi');
var Jade = require('jade');
var options = {
    url: '/', //URL to serve at
    index: 'home', //Optional filename to serve as index / base of url
    views: {
        engines: {
            jade: Jade
        },
        isCached: false,
        path: './views' //This path is read and served
    }
    routeConfigs: {
        myPage: {handler: { view: { context: { title: 'some string' } } } }
    }
};

var server = new Hapi.Server(3000);

server.pack.register([
    { plugin: require('./'), options: options }
], function (err) {
    if (err) { throw err; }
    server.start(function (err) {
        if (err) { throw err; }
        console.log('example running on port', server.info.port);
    });
});
```

This is a hapi plugin, the config takes three parameters:

- `url` is the url to serve the templates from, defaults to `/`
- `index` is an optional template name to serve at the base of the `url`
- `views` is a view config for this plugin.  The path given will be the directory that this module walks through to serve each template file it finds in it, provided the extension of that file matches one found in the `engines` parameter inside `views`
- `routeConfigs` is an object indexed by template name that will be mixed in w/ the route config for that template's route (w/ `routeConfigs` having priority).
