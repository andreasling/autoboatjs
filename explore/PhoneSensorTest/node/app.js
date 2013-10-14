var http = require("http");
var fs = require("fs");
var WebSocketServer = require("websocket").server;

function notFound(res) {
	res.writeHead(404, {"Content-Type": "text/plain"});
	res.end("not found\n");
};

function getIndex(req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	var fileStream = fs.createReadStream("../static/index.html");
	fileStream.pipe(res);
};

function getFile(req, res) {

	var url = req.url;

	var path = "../static" + url;

	var contentTypes = [
		[/\.css$/, "text/css"],
		[/\.appcache$/, "text/cache-manifest"],
		[/\.png$/, "image/png"],
		[undefined, "text/plain"]
	];

	function getContentType(url) {
		for (var i = 0; i < contentTypes.length; i++) {
			var contentType = contentTypes[i]

			if (!contentType[0] || contentType[0].test(url)) {
				return contentType[1];
			};
		};
	}

	var contentType = /* "text/plain";
	if (/\.css$/.test(url)) {
		contentType = "text/css";
	} else if (/\.appcache$/.test(url)) {
		contentType = "text/cache-manifest";
	} */ getContentType(url);

	res.writeHead(200, {"Content-Type": contentType});
	var fileStream = fs.createReadStream(path);
	fileStream.on('error', function (error) {
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.end("not found: " + error);
	});
	fileStream.pipe(res);
};

function postPing(req, res) {

	res.writeHead(200, {"Content-Type": "application/json"});

	res.write("{" + 
		"\"timestamp\":" + new Date().getTime() + "," +
		"\"requestData\":");

	req.pipe(res, { end: false });

	req.on("end", function() {
		res.end("," + 
			"\"localAddress\":\"" + req.socket.localAddress + "\"," +
			"\"remoteAddress\":\"" + req.socket.remoteAddress + "\"}");
	});

	/*res.end(JSON.stringify({
		timestamp: new Date().getTime(), 
		requestData: req.read(),
		localAddress: req.socket.localAddress,
		remoteAddress: req.socket.remoteAddress 
	}));*/

};

function postPingWS() {



};

function postData(req, res) {

	var ts = new Date().getTime();

	/* console.log("begin data");
	req.pipe(process.stdout);
	req.on("end", function() {
		console.log("\nend data");
	});*/

	console.log("writing request data to file");	
	var fileStream = fs.createWriteStream("log - " + ts + ".txt", { "flags": "a" });
	fileStream.write("{" + 
		"\"timestamp\":" + ts + "," + 
		"\"remoteAddress\":\"" + req.socket.remoteAddress + "\"," +
		"\"events\":");
	req.pipe(fileStream, { end: false });
	req.on("end", function() {
		fileStream.end("}\n");
		console.log("request data ended");
	});

	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end("ok\n");
};

function route(req, res) {
	
	var url = req.url;
	var method = req.method;

	if (url == "/") {
		getIndex(req, res);
		return;
	}

	if (/^\/api\/ping\/?$/.test(url)) {
		postPing(req, res);
		return;
	}

	if (/^\/api\/data/.test(url)) {
		if (method == "POST") {
			postData(req, res);
			return;
		}
	}

	if (/^\/css\/|\.appcache$|\.png$/.test(url)) {
		getFile(req, res);
		return;
	}

	notFound(res);
};

var count = 0;
var clients = {};


var server = http.createServer(function(req, res) {

	console.log("httpVersion: " + req.httpVersion);
	console.log("method:      " + req.method);
	console.log("url:         " + req.url);
	console.log("headers");
	console.log(req.headers);
	console.log(new Date().getTime());

	route(req, res);

}).listen(1337);


var wsServer = new WebSocketServer({
	httpServer: server
});



wsServer.on("request", function(r) {

	var connection = r.accept("echo-protocol", r.origin);

	var id = count++;
	clients[id] = connection;

	console.log("Connection accepted [" + id + "]");

	connection.on("message", function(message) {

		console.log("message from id " + id + ": ");
		console.log(message);

		var msgString = message.utf8Data;

		for (var i in clients) {
			clients[i].sendUTF(msgString + ", " + new Date().getTime());
		}
	});

	connection.on("close", function(reasonCode, description) {
		delete clients[id];
		console.log("Peer " + connection.remoteAddress + " disconnected.");
	});

});

console.log("Server running at http://*:1337/");

