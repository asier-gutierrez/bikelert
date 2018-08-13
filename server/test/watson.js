let fs = require('fs');
let path = require('path');
const Watson = require('watson-developer-cloud/visual-recognition/v3');
let visualRecognition = new Watson({
	url: 'https://gateway.watsonplatform.net/visual-recognition/api',
	api_key: 'uLQN7t3oThP1t4RMNiLXqNTYR23mc62YT7LmYDOaeoEP',
	version: '2018-03-19',
	headers: {
		'X-Watson-Learning-Opt-Out': 'true'
	}
});

let params = {
	images_file: fs.createReadStream(path.join(__dirname, '..', '..' ,'testing-pictures', '1.jpg')),
	parameters: {
		owners: ['me'],
		classifier_ids: ['Bikelert2_2001523388']
	}
};

visualRecognition.listClassifiers({verbose: true}, function(err, res) {
	if (err)
		console.log(err);
	else
		console.log(JSON.stringify(res, null, 2));
});
/*
visualRecognition.classify(params, function(err, res) {
	if (err)
		console.log(err);
	else
		console.log(JSON.stringify(res, null, 2));
});*/