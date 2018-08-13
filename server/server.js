let express = require('express'),
	app = express(),
	path = require('path'),
	Promise = require('bluebird'),
	mongoose = require('mongoose'),
	http = require('http'),
	io = require('socket.io');


//app.use(express.static(path.resolve(__dirname, '../public')));
/*
app.get('/last_image/:device_id', (req, res, next) => {
	res.sendFile(path.join(__dirname, '../temp-data', `/${req.params.device_id}.jpg`));
});
*/
if(!process.env.testing && !process.env.from_env) {
	require('dotenv').config({path: path.join(__dirname, 'service.env')});
}


let server = http.createServer(app);

server.listen(process.env.PORT, (err, result) => {
	if(err)
		throw err;
	else
		console.log('Server listening on port ' + process.env.PORT);
});


io = io(server);

global.Promise = Promise;
global.__projectBase = path.join(__dirname, '..');

mongoose.Promise = Promise;

// When successfully connected
mongoose.connection.on('connected', function () {
	console.log('Mongoose default connection open');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
	console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
	console.log('Mongoose default connection disconnected');
});

mongoose.connect(process.env.mongo_connection_string, {useNewUrlParser: true});


global.Model = require('./model');
global.Config = require('./config');
global.devicesNSP = io.of('/v1_devices');
global.dataNSP = io.of('/v1_data');

// Device setup
const deviceLoginV1 = require('./controller/device/v1/login');
const deviceDisconnectV1 = require('./controller/device/v1/disconnect');
const deviceImageV1 = require('./controller/device/v1/image');
devicesNSP.on('connection', (socket) => {
	socket.on('disconnect', () => {deviceDisconnectV1(socket)});
	socket.on('LOGIN', (data)=>{deviceLoginV1(socket, data)});
	socket.on('IMAGE', (data) => {deviceImageV1(socket, data)});
});

// Client setup
const clientBoundingBoxChangedV1 = require('./controller/client/v1/boundingBoxChanged');
const clientDisconnectV1 = require('./controller/client/v1/disconnect');
const clientActionOnOffV1 = require('./controller/client/v1/actionOnOff');
dataNSP.on('connection', (socket) => {
	socket.on('disconnect', () => {clientDisconnectV1(socket)});
	socket.on('BOUNDING_BOX_CHANGED', (data) => {clientBoundingBoxChangedV1(socket, data)});
	socket.on('ACTION_ON_OFF', (data) => {clientActionOnOffV1(socket, data);});
});

let gracefullExitFunc = (err) => {
	console.log(err);
	Promise.all([
		global.Model.ActiveClient.remove({}).exec(),
		global.Model.ActiveDevice.remove({}).exec()
	]).then(() => {
		console.log("Removed all active clients and devices.");
		mongoose.connection.close(function () {
			console.log('Mongoose default connection disconnected through app termination');
			process.exit(0);
		});
	});
};

process.on('uncaughtException', gracefullExitFunc);
process.on('beforeExit', gracefullExitFunc);