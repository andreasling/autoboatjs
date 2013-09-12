var http = require("http");
http.createServer(function (request, response) {
  console.log();
  console.log("** request **");
  console.log("method: ", request.method);
  console.log("url: ", request.url);
  console.log("head: ", request.headers);
  response.writeHead(200, {"Content-Type":"text/plain"});
  response.end("hello world! /netbook");
}).listen(1337, "172.20.10.4");
console.log("server running");
