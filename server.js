var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

// create a server
http.createServer(function (req, res) {

    // parse the request url
    var pathname = url.parse(req.url).pathname;

    console.log('Request received for: ' + pathname);

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

    // if the request url is /images then serve the images folder directory listing
    else if (pathname == "/images") {
        fs.readdir(__dirname + "/images", function (err, files) {
            if (err) {
                res.writeHead(500);
                console.error('Error loading images:', err);
                return res.end('Error loading images');
            }
            res.writeHead(200);
            console.log('Sending image list:', files);
            res.end(JSON.stringify(files));
        });
    }

    // if the request url is /images/<filename> then serve the file
    else if (pathname.substring(0, 8) == "/images/") {
        var filename = path.basename(pathname);
        fs.readFile(__dirname + "/images/" + filename, function (err, data) {
            if (err) {
                res.writeHead(500);
                console.error('Error loading ' + filename + ':', err);
                return res.end('Error loading ' + filename);
            }
            res.writeHead(200);
            console.log('Sending image:', filename);
            res.end(data);
        });
    }

    // if the request url is anything else then return a 404
    else {
        res.writeHead(404);
        console.log('Unknown request:', pathname);
        res.end();
    }

}).listen(8088, function () {
    console.log('Server listening on port 8088');
});