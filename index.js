'use strict';

const request = require('superagent');
const nlp = require('nlp_compromise');
const dict = require(__dirname + '/dictionary')

const process = (body) => {
	let msg = getMessage(body);
	msg = preprocess(msg);
}

const getMessage = (body) => {
	let msg = [];

	for(let i=0; i < body.data.length; i++) {
		if(!body.data[i].attributes.deleted)
			msg.push(body.data[i].attributes.message);
	}

	return msg;
}

const preprocess = (msg) => {
	let usernamePattern = /@[A-Za-z0-9]+/g;
	let urlPattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
	let nonAlphaNumPattern = /[^a-zA-Z0-9 ]+/g;

	msg = removePattern(msg, usernamePattern);
	msg = removePattern(msg, urlPattern);
	msg = removePattern(msg, nonAlphaNumPattern);
	msg = toLower(msg);
	msg = changeAbbrev(msg);
	msg = removeNounAndArticles(msg);

	console.log(msg);
}

const removePattern = (msg, pattern) => {
	let msg2 = [];
	
	for(let i=0; i < msg.length; i++) {
		let str = msg[i].replace(pattern, '');
		msg2.push(str);
	}

	return msg2;
}

const toLower = (msg) => {
	let msg2 = [];
	
	for(let i=0; i < msg.length; i++) {
		msg2.push(msg[i].toLowerCase());
	}

	return msg2;
}

const changeAbbrev = (msg) => {
	let msg2 = [];

	for(let i=0; i < msg.length; i++) {
		let words = msg[i].split(' ');
		let words2 = [];
		let replaced = false;
		for(let j=0; j < words.length; j++) {
			for(let k=0; k < dict.abbreviated.length; k++) {
				if(words[j] === dict.abbreviated[k].short) {
					words2.push(dict.abbreviated[k].long);
					replaced = true;
					break;
				}
			}

			if(!replaced) {
				words2.push(words[j]);
			}
		}

		msg2.push(words2.join(' '));
	}

	return msg2;
}

const removeNounAndArticles = (msg) => {
	let msg2 = [];

	for(let i=0; i<msg.length; i++) {
		let words = msg[i].split(' ');
		let words2 = [];

		for(let j=0; j<words.length; j++) {
			let tag = nlp.text(words[j]).tags();

			if(tag[0]){
				if(tag[0][0] === 'Determiner') {
					continue;
				} else if(tag[0][0] === "Noun") {
					for(let k=0; k < dict.emoticons.length; k++) {
						if(words[j] === dict.emoticons[k]){
							words2.push(words[j]);
						}
					}
				} else if(tag[0][0] === 'Person') {
					continue;
				} else if(tag[0][0] === 'Pronoun') {
					continue;
				} else if(tag[0][0] === 'Demonym') {
					continue;
				} else if(tag[0][0] === 'Value') {
					continue;
				} else {
					words2.push(words[j]);
				}
			}
		}

		msg2.push(words2.filter((element) => {
			return element
		}).join(' '));
	}

	return msg2;
}

request
	.get('https://rechat.twitch.tv/rechat-messages?start=1471106708&video_id=v83400929')
	.end((err, res) => {
		if(err)
			console.log(JSON.stringify(err));
		else
			process(res.body);
	});