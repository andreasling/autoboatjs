var fs = require("fs");
var js = require("JSONStream");

var ts0 = -1;

fs.createReadStream("C:\\code\\PhoneSensorTest\\node\\data-201309022200.json")
  .pipe(js.parse("events.*"))
  .on("data", function(d) {

    if (ts0 < 0)
      ts0 = d.timestamp;

  	//pingTimes(d);
  	//clientServerPingTimeDiffs(d);
  	//locationTimeDiffs(d);


  	//locationAccuracies(d);
  	exportLocation(d);
  })
  .on("end", function() {
  	//console.log(counts);
  	//console.log(accCount);
  	ofs.end();
  });

var lastLocation = {};
var ofs = fs.createWriteStream("C:\\code\\PhoneSensorTest\\node\\locations-201309022200.txt");
function exportLocation(d) {
	if (d.type == "location") {
		var coords = d.data.coords;
		var latitude = coords.latitude;
		var longitude = coords.longitude;
		var accuracy = coords.accuracy;
		//var c = accuracy
		//var rgb = 

		if (latitude != lastLocation.latitude || longitude != lastLocation.longitude) {
			ofs.write(latitude + "\t" + longitude + "\t" + accuracy + "\n");
			lastLocation.latitude = latitude;
			lastLocation.longitude = longitude;
		}
	};
};

var accCount = {};
function locationAccuracies(d) {
	if (d.type == "location") {
		//console.log(d.data.coords.accuracy);
		accCount[d.data.coords.accuracy.toString()] = 
			(accCount[d.data.coords.accuracy.toString()] || 0) + 1;
	};
};

var counts = {};
function locationTimeDiffs(d) {
	if (d.type == "location") {
		var diff = d.timestamp - d.eventTimestamp;

		var key = "<=" + (Math.ceil(diff / 100) * 100).toString();

		counts[key] = (counts[key] || 0) + 1;
	}
};

function clientServerPingTimeDiffs(d) {
  if (d.type == "ping" && d.data != "error") {
  	var estimatedServerTimestamp = (d.timestamp + d.data.requestTimestamp) / 2;
    console.log((d.timestamp - ts0)/1000 + ": " + (estimatedServerTimestamp - d.data.responseTimestamp)/1000);
  }
};

function pingTimes(d) {
  if (d.type == "ping" && d.data != "error") {
    console.log((d.timestamp - ts0)/1000 + ": " + (d.timestamp - d.data.requestTimestamp)/1000);
  }
};