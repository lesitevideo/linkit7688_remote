#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http = require('http');
const mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console


var myDigitalPin = new mraa.Gpio(1); //GPIO 1 cf : https://s3-ap-southeast-1.amazonaws.com/mediatek-labs-imgs/downloads/9cda5ac9d20dac0b5c043a1d6f23f75b.pdf
myDigitalPin.dir(mraa.DIR_IN); //set the gpio direction to input

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}



wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
	
	//var number = Math.round(Math.random() * 0xFFFFFF);
    //connection.sendUTF(number.toString());
	
    /*connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });*/
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
	
	function periodicActivity() {
    	var myDigitalValue = myDigitalPin.read(); //read the digital value of the pin
    	//console.log('Gpio value is ' + myDigitalValue); //write the read value out to the console
		if( myDigitalValue ){
			connection.sendUTF(myDigitalValue.toString());
		}
		
	}
	
	setInterval(periodicActivity, 100);
});


