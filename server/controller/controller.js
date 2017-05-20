'use strict';

const config 	= require(__dirname + '/../config/config');
const fs 		= require('fs');
const nlp 		= require('nlp_compromise');
const natural	= require('natural');
const ml 		= require('machine_learning');

const tfidf			= new natural.TfIdf();
const bayes 		= new natural.BayesClassifier();

const svm_options = {
	C: 10,
	tol: 1e-5,
	max_passes: 100,

	kernel: { type: 'polynomial', c: 5, d: 3},
}

const filename = 'output.txt';

let sAmusing;
let sNeutral;
let sPathetic;
let sInfuriate;

let emoticonsDone	= false;
let emoticonsLoading = false;
let emoticons;

const preprocess = (msg) => {
	let usernamePattern = /@[A-Za-z0-9_]+/g;
	let commandPattern = /![A-Za-z0-9_\-]+/g;
	let urlPattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
	let nonAlphaNumPattern = /[^a-zA-Z0-9# ]+/g;

	let oldMsg = msg;

	msg = removePattern(msg, commandPattern);
	msg = removePattern(msg, usernamePattern);
	msg = removePattern(msg, urlPattern);
	msg = toLoL(msg);
	msg = toLower(msg);


	msg = changeAbbrev(msg);
	msg = toExtend(msg);
	msg = removePattern(msg, nonAlphaNumPattern);

	msg = removeNounAndArticles(msg);
	msg = normalize(msg);

	return msg;
}

const toLoL = (msg) => {
	return msg.replace(/LoL/g, "league of legends");
}

const removePattern = (msg, pattern) => {
	return msg.replace(pattern, '');
}

const replacePattern = (msg, newWord, pattern) => {
	return msg.replace(pattern, newWord);
}

const normalize = (msg) => {
	let words = msg.split(' ');
	let words2 = [];

	for(let i=0; i < words.length; i++) {
		let isEmoticon = false;
		for(let j=0; j < emoticons.length; j++) {
			if(words[i] === emoticons[j].toLowerCase()){
				words2.push(words[i]);
				isEmoticon = true;
			}
		}

		if(!isEmoticon) {
			words2.push(nlp.text(words[i]).root());
		}
	}

	return words2.join(' ');
}

const toExtend = (msg) => {
	return nlp.text(msg).contractions.expand().text();
}

const toLower = (msg) => {
	return msg.toLowerCase();
}

const changeAbbrev = (msg) => {
	let words = msg.split(' ');
	let words2 = [];
	for(let j=0; j < words.length; j++) {
		let replaced = false;
		for(let k=0; k < config.abbreviated.length; k++) {
			if(words[j] === config.abbreviated[k].short) {
				words2.push(config.abbreviated[k].long);
				replaced = true;
				break;
			}
		}

		if(!replaced) {
			words2.push(words[j]);
		}
	}

	return words2.join(' ');
}

const removeNounAndArticles = (msg) => {
	let words = msg.split(' ');
	let words2 = [];

	for(let j=0; j<words.length; j++) {
		let tag = nlp.text(words[j]).tags();

		if(tag[0]){
			if(tag[0][0] === 'Determiner') {
				continue;
			} else if(tag[0][0] === "Noun") {
				for(let k=0; k < emoticons.length; k++) {
					if(words[j] === emoticons[k].toLowerCase()){
						words2.push(words[j]);
						break;
					}
				}

				for(let k=0; k < config.swears.length; k++) {
					if(words[j] === config.swears[k].toLowerCase()){
						words2.push(words[j]);
						break;
					}
				}
			} else if(tag[0][0] === 'Person') {
				continue;
			} else if(tag[0][0] === 'Possessive') {
				continue;
			} else if(tag[0][0] === 'Pronoun') {
				continue;
			} else if(tag[0][0] === 'Place') {
				continue;
			} else if(tag[0][0] === 'Demonym') {
				continue;
			} else if(tag[0][0] === 'Determiner') {
				continue;
			} else if(tag[0][0] === 'Plural') {
				continue;
			} else if(tag[0][0] === 'Country') {
				continue;
			} else if(tag[0][0] === 'MalePerson') {
				continue;
			} else if(tag[0][0] === 'FemalePerson') {
				continue;
			} else if(tag[0][0] === 'Organization') {
				continue;
			} else if(tag[0][0] === 'Value') {
				for(let k=0; k < emoticons.length; k++) {
					if(words[j] === emoticons[k].toLowerCase()){
						words2.push(words[j]);
						break;
					}
				}
			} else {
				words2.push(words[j]);
			}
		}
	}

	return words2.filter((element) => {
		return element
	}).join(' ');
}

const naive_classify = (msg) => {
	let res = [];

	return bayes.classify(msg);
}

const train_bayes = (data) => {
	for(let i=0; i<data.length; i++) {
		let msg = preprocess(data[i].message);

		bayes.addDocument(msg, data[i].classification);
	}

	bayes.train();

	console.log('Naive Bayes done training.');
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

	//console.log(prob);

	switch(maxIndex) {
		case 0: return 'amusing';
		case 1: return 'pathetic';
		case 2: return 'infuriating';
		default: return 'neutral';
	}
}

const train_SVM = (data) => {
	let mat = [];

	let amusing_label = [];
	let neutral_label = [];
	let pathetic_label = [];
	let infuriating_label = [];

	let max = 0;

	for(let i=0; i<data.length; i++) {
		let msg = preprocess(data[i].message);
		tfidf.addDocument(msg);
	}

	for(let i=0; i<data.length; i++) {
		let msg = preprocess(data[i].message);
		let arr = tfidf.tfidfs(msg);
		let arr2;

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

	sAmusing = new ml.SVM({x: mat, y: amusing_label });
	sNeutral = new ml.SVM({x: mat, y: neutral_label });
	sPathetic = new ml.SVM({x: mat, y: pathetic_label });
	sInfuriate = new ml.SVM({x: mat, y: infuriating_label });

	sAmusing.train(svm_options);
	sNeutral.train(svm_options);
	sPathetic.train(svm_options);
	sInfuriate.train(svm_options);

	console.log('SVM done training.');
}

const loadEmoticons = (callback) => {
	config.emoticons.then(
		(result) => {
			emoticons = result;
			callback();

			console.log('Emoticons done loading...');
		}, (error) => {
			process.exit(error.NO_EMOTICONS);
		}
	);
}

const init = () => {
	if(!emoticonsDone) {
		if(!emoticonsLoading) {
			emoticonsLoading = true;
			loadEmoticons(() => {
				emoticonsDone = true;
			});
		}

		setTimeout(init, 1000);
		return;
	}

	let data = JSON.parse(fs.readFileSync(__dirname + '/results.json', 'utf-8')).filter((n) => {
		return preprocess(n.message).trim() !== '';
	});

	console.log(data.length + ' training data loaded.');


	/*fs.writeFileSync(filename, '');
	data.forEach((item, index) => {
		fs.appendFileSync(filename, item.message + '|' + item.classification + '\n');
	})*/

	train_bayes(data);
	train_SVM(data);
}

/****************************************************/

exports.process = preprocess;

exports.preprocess = (req, res, next) => {
	return res.send({message: preprocess(req.body.message)});
}

exports.init = init;
exports.loadEmoticons = loadEmoticons;
exports.svm_options = svm_options;

exports.hello = (req, res, next) => {
	return res.send({message: 'Hello World!'});
}


exports.naive_bayes = (req, res, next) => {
	let msgs = JSON.parse(req.body.data);
	let result = {
		amusing: 0,
		neutral: 0,
		pathetic: 0,
		infuriating: 0,
		unclassified: 0,
		total: msgs.length
	};

	msgs.forEach((item, index) => {
		if(item) {
			let str = preprocess(item);
			if(str) {
				let cat = naive_classify(str);
				result[cat]++;
			} else {
				result.unclassified++;
			}
		}
	});

	res.send({data: JSON.stringify(result)});
}

exports.support_vector = (req, res, next) => {
	let msgs = JSON.parse(req.body.data);
	let result = {
		amusing: 0,
		neutral: 0,
		pathetic: 0,
		infuriating: 0,
		unclassified: 0,
		total: msgs.length
	};

	msgs.forEach((item, index) => {
		if(item) {
			let str = preprocess(item);
			if(str) {
				let cat = svm_classify(str);
				result[cat]++;
			} else {
				result.unclassified++;
			}
		}
	});

	res.send({data: JSON.stringify(result)});
}