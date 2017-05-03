'use strict'

const fs 			= require('fs');
const nlp			= require('nlp_compromise');
const natural		= require('natural');
const controller	= require(__dirname + '/../controller');
const ml 			= require('machine_learning');

const file_name 	= __dirname + '/data/X.json';
const output 		= 'output.txt';
const tfidf			= new natural.TfIdf();

let bayes;

const total = 440;


let sAmusing;
let sNeutral;
let sPathetic;
let sInfuriate;

let emoticonsDone = false;
let emoticonsLoading = false;

let mat_bayes = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
];

let mat_svm = [
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
	return bayes.classify(msg);
}

const train_bayes = (data) => {
	for(let i=0; i<data.length; i++) {
		let msg = controller.process(data[i].message);

		bayes.addDocument(msg, data[i].classification);
	}

	bayes.train();

	console.log('Done training Naive Bayes.');
}

const svm_classify = (msg) => {
	let arr = tfidf.tfidfs(msg);
	let prob = [];
	let max = 0, maxIndex = -1;
	let res;

	prob.push(sAmusing.f(arr));
	prob.push(sPathetic.f(arr));
	prob.push(sInfuriate.f(arr));
	prob.push(sNeutral.f(arr));

	for(let i=0; i<prob.length; i++) {
		if(max <= prob[i]) {
			max = prob[i];
			maxIndex = i;
		}
	}

	switch(maxIndex) {
		case 0: return 'amusing';
		case 1: return 'pathetic';
		case 2: return 'infuriating';
		default: return 'neutral';
	}
}

const train_svm = (data) => {
	let mat = [];

	let amusing_label = [];
	let neutral_label = [];
	let pathetic_label = [];
	let infuriating_label = [];

	let max = 0;

	for(let i=0; i<data.length; i++) {
		let msg = controller.process(data[i].message);
		tfidf.addDocument(msg);
	}

	for(let i=0; i<data.length; i++) {
		let msg = controller.process(data[i].message);
		let arr = tfidf.tfidfs(msg);
		let arr2;

		//console.log('data ' + i);

		arr2 = arr.filter((e) => {
			return e;
		});
		
		if(!arr2.length) continue;

		mat.push(arr);

		if(data[i].classification === 'amusing') {
			amusing_label.push(1);
			neutral_label.push(-1);
			pathetic_label.push(-1);
			infuriating_label.push(-1);
		} else if(data[i].classification === 'neutral') {
			amusing_label.push(-1);
			neutral_label.push(1);
			pathetic_label.push(-1);
			infuriating_label.push(-1);
		} else if(data[i].classification === 'pathetic') {
			amusing_label.push(-1);
			neutral_label.push(-1);
			pathetic_label.push(1);
			infuriating_label.push(-1);
		} else {
			amusing_label.push(-1);
			neutral_label.push(-1);
			pathetic_label.push(-1);
			infuriating_label.push(1);
		}
	}

	//console.log('Done creating the matrix.');

	sAmusing = new ml.SVM({x: mat, y: amusing_label });
	sNeutral = new ml.SVM({x: mat, y: neutral_label });
	sPathetic = new ml.SVM({x: mat, y: pathetic_label });
	sInfuriate = new ml.SVM({x: mat, y: infuriating_label });

	sAmusing.train(controller.svm_options);
	sNeutral.train(controller.svm_options);
	sPathetic.train(controller.svm_options);
	sInfuriate.train(controller.svm_options);

	console.log('Done training SVM.');
}

const createMat = (svm_options) => {
	let correct = 0;

	mat_bayes = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	];

	mat_svm = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	];

	fs.appendFileSync(output, JSON.stringify(svm_options) + '\n');

	for(let i=0; i<10; i++) {
		let msgs = JSON.parse(fs.readFileSync(file_name.replace('X', i + ''), 'utf-8'));

		console.log('iter: ' + i);

		bayes = new natural.BayesClassifier();
		train_bayes(msgs.test);
		train_svm(msgs.test, svm_options);

		msgs.train.forEach((item, index) => {
			let classif_bayes = naive_classify(controller.process(item.message));
			let classif_svm = svm_classify(controller.process(item.message));

			mat_bayes[cat[item.classification]][cat[classif_bayes]]++;
			mat_svm[cat[item.classification]][cat[classif_svm]]++;
		});
	}

	for(let i=0; i<4; i++) {
		for(let j=0; j<4; j++) {
			fs.appendFileSync(output, mat_svm[i][j] + '\t');
		}
		fs.appendFileSync(output, '\n');
	}
	fs.appendFileSync(output, '\n');

	for(let j=0; j<4; j++) {
		correct += mat_svm[j][j];
	}

	console.log((correct/total));
}

const start = () => {
	if(!emoticonsDone) {
		if(!emoticonsLoading) {
			emoticonsLoading = true;
			controller.loadEmoticons(() => {
				emoticonsDone = true;
			})
		}

		setTimeout(start, 1000);
		return;
	}


	const svm_options = {
		C: 10,
		tol: 1e-5,
		max_passes: 100,

		kernel: { type: 'polynomial', c: 5, d: 3},
	}

	fs.writeFileSync(output, '');

	createMat(svm_options);
	svm_options.max_passes = 1000;
	createMat(svm_options);

	console.log('Done!');
}

//start();