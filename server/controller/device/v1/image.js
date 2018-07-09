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
				classifier_ids: ['PUT CLASSIFIER ID'] //TODO
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
	let pathOfFile = path.join(__dirname, '../../../temp-data/', `${socket.activeDevice.device_id}.jpg`);
	try {fs.truncateSync(pathOfFile, 0)} catch(e) {}
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
				device_id: socket.activeDevice.device_id,
				date: new Date(),
				positive: bestPrediction && bestPrediction.score > 0.5 && bestPrediction.class == 'CLASS NAME'
			})
				.save()
		})
};

module.exports = (socket, data) => {
	if(socket.device)
		Promise
			.all([
				uploadAndAnalyzeImage(data),
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
			.spread((events, clients) => {
				clients.forEach((client) => {
					if(dataNSP.sockets[client.socket_id])
						events.forEach((event) => {
							dataNSP.sockets[client.socket_id].emit('EVENT', event);
						});
				})
			})
			.catch((err) => {
				console.log(`Event error: ${err}`)
			})
};