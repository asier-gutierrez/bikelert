const fs = require('fs'),
	path = require('path');


const analyzeWatson = (data) => {
	return new Promise((resolve, reject) => {
		let params = {
			images_file: {
				value: new Buffer(data.data),
				options:{
					filename: data.filename,
					contentType: 'image/jpeg'
				}
			},
			parameters: {
				threshold: 0.0,
				owners: ['me'],
				classifier_ids: [process.env.watson_visual_recognition_classifier_id]
			}
		};
		global.Config.WatsonVisualRecognition.classify(params, (err, result) => {
			if(err)
				reject(err);
			else
				resolve(result);
		});
	});
};


const uploadAndAnalyzeImage = (socket, data) => {
	let pathOfFile = path.join(__dirname, '..', '..', '..', '..', 'temp-data', `${socket.device.device_id}.jpg`);
	try {
		fs.truncateSync(pathOfFile, 0);
	}
	catch(e) {
		//throw e;
		console.error(e);
	}
	fs.appendFile(pathOfFile, new Buffer(data.data), function (err) {
		if (err)
			console.log(err);
	});
	return analyzeWatson(data)
		.then((result) => {
			let bestPrediction = undefined;
			if(result.images[0].classifiers[0].classes)
				result.images[0].classifiers[0].classes.forEach((prediction) => {
					if(bestPrediction) {
						if (bestPrediction.score < prediction.score)
							bestPrediction = prediction;
					} else
						bestPrediction = prediction;
				});
			return new global.Model.Event({
				device_id: socket.device.device_id,
				date: new Date(),
				positive: bestPrediction && bestPrediction.score > 0.5 && bestPrediction.class == process.env.watson_visual_recognition_positive_class_name
			})
				.save();
		})
};

module.exports = (socket, data) => {
	if(socket.device)
		Promise
			.all([
				uploadAndAnalyzeImage(socket, data),
				global.Model.ActiveClient
					.find({
						boundingBox: {
							$geoIntersects: {
								$geometry: {
									type: 'Point',
									coordinates: socket.device.location.coordinates
								}
							}
						}
					})
					.exec()
			])
			.spread((event, clients) => {
				// Spreads both positive and negative events to the socket sender.
				socket.emit('IMAGE_EVENT', event);

				// Only spread positive events to clients-
				if(event.positive)
					clients.forEach((client) => {
						if(dataNSP.sockets[client.socket_id])
							dataNSP.sockets[client.socket_id].emit('EVENT', event);
					});
			})
			.catch((err) => {
				console.log(`Event error: ${err}`)
			});
};