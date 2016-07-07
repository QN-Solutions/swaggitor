
var http = require('http');
var app = require('connect')();
var serveStatic = require('serve-static');
var path = require('path');
var util = require('util');
var fs = require('fs');

var Swaggitor = function(config) {
    // initialize server configuration
    this.serverConfig = {
        swagger_path: '/api/',
        main_swagger_file: 'swagger.yaml',
        save_path: '/editor/spec',
        load_path: '/editor/spec',
        config_path: '/config/defaults.json',
        editor_path: 'node_modules/swagger-editor/',
        hostname: 'localhost',
        directory: '/',
        port: 10012
    };

    // init editor configuration
    this.editorConfig = {
        analytics: { google: { id: null } },
        disableCodeGen: true,
        disableNewUserIntro: true,
        examplesFolder: '/spec-files/',
        exampleFiles: [],
        autocompleteExtension: {},
        useBackendForStorage: true,
        backendEndpoint: '/editor/spec',
        backendHealthCheckTimeout: 5000,
        useYamlBackend: true,
        disableFileMenu: true,
        enableTryIt: true,
        headerBranding: false,
        brandingCssClass: null,
        schemaUrl: '/schema/swagger.json',
        importProxyUrl: 'https://cors-it.herokuapp.com/?url='
    };
    
    // parse config and merge values into config member objects
    if( !this.validateConfiguration(config) ) {
        throw new Error("Invalid serverr configuration.");
    }
    else {
        this.serverConfig = config;
    }

    // make this available in callbacks
    var self = this;
    
    this.pathToSwaggerFile = path.join('.', this.serverConfig.swagger_path, this.serverConfig.main_swagger_file)

    // check if swagger file is actually available, throws exception otherwise
    //try {
        fs.accessSync(this.pathToSwaggerFile);
    /*} catch(exception) {
        console.log(exception.message);
    }*/

    /*
        Handler for the save operation of the editor.
    */
    app.use(this.serverConfig.save_path, function(req, res, next) {
        // continue if this is no put operation
        if(req.method !== 'PUT') return next();

        // write file to disk
        var fileStream = fs.createWriteStream(self.pathToSwaggerFile);
        req.pipe(fileStream);

        fileStream.on('finish', function() {
            res.end('ok');
        });
    });

    /*
        Handler to serve the Swagger file for editing.
    */
    app.use(this.serverConfig.load_path, serveStatic(this.pathToSwaggerFile));

    /*
        Provide configuration to the editor.
    */
    app.use(this.serverConfig.config_path, function(req, res, next) {
        if(req.method !== 'GET') return next();
        
        res.end(JSON.stringify(self.editorConfig));
    });

    /*
        Serve editor application files.
    */
    app.use(this.serverConfig.directory, serveStatic(this.serverConfig.editor_path));

    /*
        Provide external swagger definitions if referenced from main swagger file.
    */
    app.use('/api/', serveStatic('./api/'));

    /*
        Start the server.
    */
    server = http.createServer(app);
    server.listen(this.serverConfig.port, this.serverConfig.hostname, function() {
        console.log("Swagger Editor running at: %s:%d", self.serverConfig.hostname, self.serverConfig.port);
    });
}

Swaggitor.prototype.validateConfiguration = function(config) {
    // check if all necessary keys of the configuration are there
    var valid = true;
    for(var key in this.serverConfig)
    {
        if(!(key in config)) {
            console.log("Invalid configuration! Missing: %s", key);
            valid = false;
        }
    }

    // throw error when invalid
    if(!valid) return false;
    else return true;
}

module.exports = function(config) {
    return new Swaggitor(config);
};