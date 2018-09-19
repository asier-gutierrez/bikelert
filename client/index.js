"use strict"

let socketio, ioDevice, path, fs, pythonShell, imageInterval,signalTimeout, distance, time, speed, signalStatus, timeBetweenPhotos,
    filePath,photoPath,signalPath;

path = require('path');
require('dotenv').config({path: path.join(__dirname, 'service.env')});

filePath = path.join(__dirname, './image.jpg');
fs = require('fs');
pythonShell = require('python-shell');
photoPath = process.env.photoPath;
signalPath = process.env.signalPath;

imageInterval = -1;
signalTimeout = -1;
signalStatus = false;
timeBetweenPhotos = process.env.time_between_photo;
distance = process.env.distance; //Average distance
speed = process.env.speed;//Average speed of the bicycle
time = (distance / speed) * 60 * 60 * 1000;

global.Promise = require('bluebird');
socketio = require('socket.io-client');
console.log('PORT', process.env.PORT);
ioDevice = socketio(`http://localhost:${process.env.PORT}/v1_devices`);



ioDevice.on('IMAGE_EVENT', (event) => {
    var result = JSON.stringify(event.positive);

    if(result == 'true'){
    if(!signalStatus) {
    pythonShell.run(signalPath, function (err, results) {
        if (err)
            throw err;
        signalStatus = true;
        signalTimeout = setTimeout(signalManageFunc, time);
    })
    }
    else{
        clearTimeout(signalTimeout);
        signalTimeout = setTimeout(signalManageFunc, time);

    }
    }
});



ioDevice.on('connect', () => {
    console.log("Connected");
ioDevice.emit('LOGIN', {
    cred1: process.env.device_cred1,
    cred2: process.env.device_cred2
});
});

ioDevice.on('LOGIN_SUCCESSFUL', (data) => {
    console.log('Login successful');
    imageInterval = setInterval(intervalFunc, timeBetweenPhotos);
});

ioDevice.on('LOGIN_FAIL', (err) => {
    console.log('Login failed', err);
    throw err;
});



ioDevice.on('disconnect', () => {
    clearInterval(imageInterval);
    clearTimeout(signalTimeout);
    console.log('Device disconnected');
});




let intervalFunc = () => {
    console.log('Taking image...');

    pythonShell.run(photoPath, function (err, results) {
        if (err)
            throw err;
        fs.readFile(filePath, (err, file) => {
            if(err)
            throw err;
        ioDevice.emit('IMAGE', {filename: filePath, data: file});

    });
    })

}




function signalManageFunc () {
    console.log('Managing signal status...');

    pythonShell.run(signalPath, function (err, results) {
        if (err) throw err;
        signalStatus = false;

    })

}


