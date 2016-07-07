var path = require('path');
var fs = require('fs');

var configPath = process.cwd() + "/config/swaggitor.json";
var configurationFileContent = "";

try {
    // try loading the application's own configuration
    fs.accessSync(configPath);
    configurationFileContent = fs.readFileSync(configPath, 'utf8');
} catch(e) {
    console.log("No configuration file found in your application. Using the package's default config.");
    configurationFileContent = fs.readFileSync(path.resolve(__dirname, "./config/swaggitor.json"), 'utf8');
}

var config = JSON.parse(configurationFileContent);

var Swaggitor = require('./index.js')(config);