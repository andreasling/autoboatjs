var http = require("http");
var fs = require("fs");
var WebSocketServer = require("websocket").server;

function notFound(res) {
	res.writeHead(404, {"Content-Type": "text/plain"});
	res.end("not found\n");
};

function getIndex(req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	var fileStream = fs.createReadStream("steering.html");
	fileStream.pipe(res);
};

function route(req, res) {
	
	var url = req.url;
	var method = req.method;

	if (url == "/") {
		getIndex(req, res);
		return;
	}

	notFound(res);
};

var server = http.createServer(function(req, res) {

	console.log("httpVersion: " + req.httpVersion);
	console.log("method:      " + req.method);
	console.log("url:         " + req.url);
	console.log("headers: ", req.headers);
	//console.log(new Date().getTime());

	route(req, res);

}).listen(1337);


var wsServer = new WebSocketServer({
	httpServer: server
});

wsServer.on("request", function(r) {

	var connection = r.accept("echo-protocol", r.origin);

	console.log("Connection accepted");

	connection.on("message", function(message) {

		//console.log("message: ", message);

		var msgString = message.utf8Data;

		console.log(JSON.parse(msgString));

		// connection.sendUTF(msgString + ", " + new Date().getTime());

		var req = http.request({
			hostname: "192.168.0.106",
			port: 8080,
			path: "/",
			method: "POST", 
			headers: {
				"Content-Length": msgString.length
			}			
		}, function(res) {
			//console.log("status: " + res.statusCode);
			/* res.on("data", function(data) {
				console.log(data);
			}); */
		});

		req.on("error", function(e) {
			console.log("error: " + e.message);
		});

		req.write(msgString);
		req.end();
	});

	connection.on("close", function(reasonCode, description) {
		delete connection;
		console.log("Peer " + connection.remoteAddress + " disconnected.");
	});

});

/* var data = JSON.stringify({power:1,angle:0});
console.log("trying to send...");
var req = http.request({
	hostname: 
		//"localhost", 
		"192.168.0.106",
	port: 
		//1337, 
		8080,
	path: "/",
	method: "POST", 
	headers: {
		"Content-Length": data.length//,
		//"Content-Type": "text/plain"
	}
}, function(res) {
	console.log("status: " + res.statusCode);
	res.on("data", function(data) {
		console.log("data: " + data);
	});
});

req.on("error", function(e) {
	console.log("error: " + e.message);
});

console.log("writing");
req.write(data);
console.log("ending");
req.end();
console.log("done");
*/