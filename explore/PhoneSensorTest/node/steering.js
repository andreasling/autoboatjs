var http = require("http");
var fs = require("fs");
var WebSocketServer = require("websocket").server;
var dgram = require("dgram");

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
		
		connection.sendUTF(msgString + ", " + new Date().getTime());

		var message = new Buffer(msgString);
		var client = dgram.createSocket("udp4");
		client.send(message, 0, message.length, 8080, "192.168.0.106", function(err, bytes) {
			client.close();
			console.log("datagram sent");
		});
	});

	connection.on("close", function(reasonCode, description) {
		delete connection;
		console.log("Peer " + connection.remoteAddress + " disconnected.");
	});

});
