const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const {globSync} = require('glob');
const port = 18088;
const hostname = "0.0.0.0";

// create a server
http.createServer(function (req, res) {

    // parse the request url
    var pathname = url.parse(req.url).pathname;

    console.log('Request received for: ' + pathname + ' from ' + req.connection.remoteAddress);

    // Set the mime type header to the correct value
    var ext = path.extname(pathname);
    var type = 'text/html';
    switch (ext) {
        case '.js':
            type = 'text/javascript';
            break;
        case '.css':
            type = 'text/css';
            break;
        case '.jpg':
            type = 'image/jpeg';
            break;
        case '.png':
            type = 'image/png';
            break;
        case '.svg':
            type = 'image/svg+xml';
            break;
    }
    res.setHeader('Content-Type', type);
    

    // Set CSP header to allow unsafe-eval for the inline script in index.html
    // res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self'; frame-src 'self'");

    // if the request url is / then serve the index.html file
    if (pathname == "/") {
        fs.readFile(__dirname + "/index.html", function (err, data) {
            if (err) {
                res.writeHead(500);
                console.error('Error loading index.html:', err);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            console.log('Sending index.html');
            res.end(data);
        });
    }

    // serve files from the root directory
    else if (pathname.substring(0, 8) == "/static/") {
        var decodedFileName = decodeURIComponent(pathname);
        fs.readFile(__dirname + decodedFileName, function (err, data) {
            if (err) {
                res.writeHead(500);
                console.error('Error loading ' + decodedFileName + ':', err);
                return res.end('Error loading ' + decodedFileName);
            }
            res.writeHead(200);
            console.log('Sending file:', decodedFileName);
            res.end(data);
        });
    }


    // if the request url is /images then serve the images folder directory listing
    else if (pathname == "/images") {
        // get paths with forward slashes
        const files = globSync('images/**/*', {nodir: true}).map((file) => file.replace(/\\/g, '/'));
        res.writeHead(200);
        console.log('Sending image list:', files);
        res.end(JSON.stringify(files));
    }

    // if the request url is /images/<filename> then serve the file
    else if (pathname.substring(0, 8) == "/images/") {
        var decodedFileName = decodeURIComponent(pathname);
        fs.readFile(__dirname + decodedFileName, function (err, data) {
            if (err) {
                res.writeHead(500);
                console.error('Error loading ' + decodedFileName + ':', err);
                return res.end('Error loading ' + decodedFileName);
            }
            res.writeHead(200);
            console.log('Sending image:', decodedFileName);
            res.end(data);
        });
    }

    // if the request url is anything else then return a 404
    else {
        res.writeHead(404);
        console.log('Unknown request:', pathname);
        res.end();
    }

}).listen(port, hostname, function () {
    console.log('Server listening on port ' + port);
});
