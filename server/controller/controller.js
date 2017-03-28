'use strict';

const config = require(__dirname + '/../config/config');
const npl = require('nlp_compromise');

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
					if(words[j] === config.emoticons[k]){
						words2.push(words[j]);
					}
				}
			} else {
				words2.push(words[j]);
			}

			console.log(tag[0][0] + ' ' + words[j]);
		}
	}

	return words2.filter((element) => {
		return element
	}).join(' ');
}


exports.hello = (req, res, next) => {
	return res.send({message: "Hello World!"});
}

exports.preprocess_all = (req, res, next) => {
	let msgs = JSON.parse(req.body.data);
	let result = [];

	req.forEach((item, index) => {
		if(item) {
			result.push(preprocess(item));
		}
	});

	res.send({data: JSON.stringify(result)});
}