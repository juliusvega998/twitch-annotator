'use strict'

const fs 			= require('fs');
const nlp			= require('nlp_compromise');
const natural		= require('natural');
const controller	= require(__dirname + '/../controller');
const file_name 	= __dirname + '/data/X.json';

let bayes;

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
		let msg = controller.process(data[i].message);

		bayes.addDocument(msg, data[i].classification);
	}

	bayes.train();
}

const start = () => {
	for(let i=0; i<10; i++) {
		let msgs = JSON.parse(fs.readFileSync(file_name.replace('X', i + ''), 'utf-8'));
		bayes = new natural.BayesClassifier();

		train_bayes(msgs.test);

		msgs.train.forEach((item, index) => {
			let classif = naive_classify(controller.process(item.message));
			mat[cat[item.classification]][cat[classif]]++;
		});
	}

	for(let i=0; i<4; i++) {
		for(let j=0; j<4; j++) {
			fs.appendFileSync('output.txt', mat[i][j] + '\t');
		}
		fs.appendFileSync('output.txt', '\n');
	}

	console.log('Done!');
}

start();