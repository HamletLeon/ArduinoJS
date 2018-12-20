var http = require('http');
var fs = require('fs');
const five = require("johnny-five");
const board = new five.Board();

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server).origins("localhost:8081");
var events = require('events');
var em = new events.EventEmitter();
    
board.on("ready", function() {
    console.log("Ready!");

    const relay1 = new five.Pin(2);
    relay1.high();
    const relay2 = new five.Pin(3);
    relay2.high();
    const relay3 = new five.Pin(4);
    relay3.high();
    const relay4 = new five.Pin(5);
    relay4.high();

    const sensorA0 = new five.Sensor({ pin: "A0", freq: 5000 });
    const sensorA1 = new five.Sensor({ pin: "A1", freq: 5000 });

    sensorA0.on('change', (_value) => {
        em.emit('SensorA0', sensorA0.scaleTo(0, 100));
    });

    sensorA1.on('change', (_value) => {
        em.emit('SensorA1', sensorA1.scaleTo(0, 10));
    });
    
    io.sockets.on('connection', function (socket) {
        console.log('A client is connected!');
        
        socket.on("Relay1", (status) => {
            // console.log("Relay1 status: " + status);
            if (status === true) relay1.high();
            else if (status === false) relay1.low();
        });
        
        socket.on("Relay2", (status) => {
            // console.log("Relay2 status: " + status);
            if (status === true) relay2.high();
            else if (status === false) relay2.low();
        });
        
        socket.on("Relay3", (status) => {
            // console.log("Relay3 status: " + status);
            if (status === true) relay3.high();
            else if (status === false) relay3.low();
        });
        
        socket.on("Relay4", (status) => {
            // console.log("Relay4 status: " + status);
            if (status === true) relay4.high();
            else if (status === false) relay4.low();
        });

        em.on("SensorA0", (value) => {
            socket.emit("SensorA0", value);
        });

        em.on("SensorA1", (value) => {
            socket.emit("SensorA1", value);
        });
    });
});

server.listen(8080);