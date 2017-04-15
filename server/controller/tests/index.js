'use strict'

const fs 			= require('fs');
const nlp			= require('nlp_compromise');
const controller	= require(__dirname + '/../controller');
const file_name 	= __dirname + '/data/X.json';

const bayes 		= new natural.BayesClassifier();

const mat = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
];
const cat = {
	amusing: 0,
	neutral: 1,
	pathetic: 2,
	infuriating: 3
}

const naive_classify = (msg) => {
	let res = [];

	return bayes.classify(msg);
}

const train_bayes = (data) => {
	for(let i=0; i<data.length; i++) {
		let msg = controller.preprocess(data[i].message);

		bayes.addDocument(msg, data[i].classification);
	}

	bayes.train();

	console.log('Naive Bayes done training.');
}

const start = () => {
	/*for(let i=0; i<10; i++) {
		fs.readFile(file_name.replace('X', i + ''), 'utf-8', (err, data) => {
			if(err) throw err;
			else {
				let msgs = JSON.parse(data);
				train_bayes
			}
		});
	}*/

	console.log("Hello World!");
}

start();