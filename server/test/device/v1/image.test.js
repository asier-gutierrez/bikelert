let path, fs, socketio, ioDevice;

beforeAll(() => {
	path = require('path');
	fs = require('fs');
	require('dotenv').config({path: path.join(__dirname, '..', '..', '..', 'service.env')});
	global.Promise = require('bluebird');
	socketio = require('socket.io-client');
	console.log('PORT', process.env.PORT);
	ioDevice = socketio(`http://localhost:${process.env.PORT}/v1_devices`);
});


test('Send image', () => {
	return new Promise((resolve, reject) => {
		ioDevice.on('LOGIN_SUCCESSFUL', (data) => {
			console.log('IO Device successfully logged in.');
		});

		ioDevice.on('LOGIN_FAIL', (data) => {
			console.error('IO Device connection ERROR.');
			reject('Login failed.');
		});

		let filePath = path.join(__dirname, '..', '..', 'testing_pictures', '1.jpg');
		fs.readFile(filePath, (err, file) => {
			if (err)
				throw err;
			ioDevice.emit('IMAGE', {filename: filePath, data: file});
		});

		ioDevice.on('IMAGE_EVENT', (event) => {
			console.log('Event received: ', JSON.stringify(event));
			resolve(event);
		});

		ioDevice.on('connect', () => {
			console.log('IO Device connection started. Sending credentidals...');
			ioDevice.emit('LOGIN', {
				cred1: process.env.test_device_cred1,
				cred2: process.env.test_device_cred2
			});
		});
	});
});