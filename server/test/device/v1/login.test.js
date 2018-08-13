let socketio, ioDevice;

beforeAll(() => {
	let path = require('path');
	require('dotenv').config({path: path.join(__dirname, '..', '..', '..', 'service.env')});
	global.Promise = require('bluebird');
	socketio = require('socket.io-client');
	console.log('PORT', process.env.PORT);
	ioDevice = socketio(`http://localhost:${process.env.PORT}/v1_devices`);
});

test('Device login', () => {
	return new Promise((resolve, reject) => {
		ioDevice.on('LOGIN_SUCCESSFUL', (data) => {
			console.log('IO Device successfully logged in.');
			resolve();
		});

		ioDevice.on('LOGIN_FAIL', (data) => {
			console.error('IO Device connection ERROR.');
			reject('Login failed.');
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

afterAll(() => {
	ioDevice.disconnect();
});