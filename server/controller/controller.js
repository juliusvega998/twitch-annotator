'use strict';

const config 	= require(__dirname + '/../config/config');
const fs 		= require('fs');
const nlp 		= require('nlp_compromise');
const natural	= require('natural');
const svm 		= require('node-svm');

const tfidf			= new natural.TfIdf();
const bayes 		= new natural.BayesClassifier();

const sAmusing		= new svm.SVM();
const sNeutral		= new svm.SVM();
const sPathetic		= new svm.SVM();
const sInfuriate	= new svm.SVM();

let data;

const preprocess = (msg) => {
	let usernamePattern = /@[A-Za-z0-9_]+/g;
	let commandPattern = /![A-Za-z0-9_\-]+/g;
	let urlPattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
	let nonAlphaNumPattern = /[^a-zA-Z0-9# ]+/g;

	let oldMsg = msg;
	let str = "";

	msg = removePattern(msg, commandPattern);
	msg = removePattern(msg, usernamePattern);
	msg = removePattern(msg, urlPattern);
	msg = toLower(msg);

	msg = changeAbbrev(msg);
	msg = toExtend(msg);
	msg = removePattern(msg, nonAlphaNumPattern);

	msg = removeNounAndArticles(msg);
	msg = normalize(msg);

	return msg;
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
		for(let j=0; j < config.emoticons.length; j++) {
			if(words[i] === config.emoticons[j]){
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
				for(let k=0; k < config.emoticons.length; k++) {
					if(words[j] === config.emoticons[k]){
						words2.push(words[j]);
					}
				}

				for(let k=0; k < config.swears.length; k++) {
					if(words[j] === config.swears[k]){
						words2.push(words[j]);
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
				for(let k=0; k < config.emoticons.length; k++) {
					if(words[j] === config.emoticons[k].toLowerCase()){
						words2.push(words[j]);
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
	let arr = [];
	let prob = [];
	let res;
	let min = 1, minIndex = -1;

	msg.split(' ').forEach((item, index) => {
		tfidf.tfidfs(item).forEach((item2, index2) => {
			arr.push(item2);
		});
	});

	prob.push(sAmusing.predictProbabilitiesSync(arr));
	prob.push(sPathetic.predictProbabilitiesSync(arr));
	prob.push(sInfuriate.predictProbabilitiesSync(arr));
	prob.push(sNeutral.predictProbabilitiesSync(arr));

	for(let i=0; i<prob.length; i++) {
		if(min < prob[i]) {
			min = prob[i];
			minIndex = i;
		}
	}

	switch(minIndex) {
		case 0: return 'amusing';
		case 2: return 'pathetic';
		case 3: return 'infuriating';
		default: return 'neutral';
	}
}

const train_SVM = (data) => {
	let amusing_mat = [];
	let neutral_mat = [];
	let pathetic_mat = [];
	let infuriating_mat = [];

	for(let i=0; i<data.length; i++) {
		let msg = preprocess(data[i].message);

		tfidf.addDocument(msg);
	}

	for(let i=0; i<data.length; i++) {
		let msg = preprocess(data[i].message);

		msg.split(' ').forEach((item, index) => {
			let arr = tfidf.tfidfs(item);

			if(data[i].classification === 'amusing') {
				amusing_mat.push([arr, 1]);
				neutral_mat.push([arr, 0]);
				pathetic_mat.push([arr, 0]);
				infuriating_mat.push([arr, 0]);
			} else if(data[i].classification === 'neutral') {
				amusing_mat.push([arr, 0]);
				neutral_mat.push([arr, 1]);
				pathetic_mat.push([arr, 0]);
				infuriating_mat.push([arr, 0]);
			} else if(data[i].classification === 'pathetic') {
				amusing_mat.push([arr, 0]);
				neutral_mat.push([arr, 0]);
				pathetic_mat.push([arr, 1]);
				infuriating_mat.push([arr, 0]);
			} else {
				amusing_mat.push([arr, 0]);
				neutral_mat.push([arr, 0]);
				pathetic_mat.push([arr, 0]);
				infuriating_mat.push([arr, 1]);
			}
		});
	}

	sAmusing.train(amusing_mat);
	sNeutral.train(neutral_mat);
	sPathetic.train(pathetic_mat);
	sInfuriate.train(infuriating_mat);

	console.log('SVM done training.');
}


/****************************************************/
exports.init = () => {
	data = JSON.parse(fs.readFileSync(__dirname + '/results.json', 'utf-8')).filter((n) => {
		return preprocess(n.message).trim() !== '';
	});

	console.log(data.length + ' training data loaded.');

	train_bayes(data);
	train_SVM(data);

}


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
		total: msgs.length
	};

	msgs.forEach((item, index) => {
		if(item) {
			let str = preprocess(item);
			if(str) {
				let cat = naive_classify(str);
				result[cat]++;
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
		total: msgs.length
	};

	msgs.forEach((item, index) => {
		if(item) {
			let str = preprocess(item);
			if(str) {
				let cat = svm_classify(str);
				result[cat]++;
			}
		}
	});

	res.send({data: JSON.stringify(result)});
}