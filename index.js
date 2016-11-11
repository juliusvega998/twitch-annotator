'use strict';

const request = require('superagent');
const http = require('http');
const nlp = require('nlp_compromise');
const dict = require(__dirname + '/dictionary')
const url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=vVIDID';
const video_id = '83400929';
const MAX_ITER = 10000;

const start = () => {
	gatherTimePeriod();
}

const gatherTimePeriod = () => {
	request
		.get(url.replace("VIDID", video_id).replace("TIME", 0))
		.end((err, res) => {
			if(err){
				let toks = res.body.errors[0].detail.split(' ');
				console.time("getMsg");
				let msg = gatherMsgs([], parseInt(toks[4]), parseInt(toks[6]), 0);
			}
		});
}

const gatherMsgs = (msg, i, end, iter) => {
	if(i == end) {
		console.timeEnd("getMsg");
		return msg;
	} else if(iter >= MAX_ITER) {
		console.log("Maximum tries reached.");
		console.timeEnd("getMsg");
		return msg;
	} else {
		request
			.get(url.replace("VIDID", video_id).replace("TIME", i))
			.end((err, res) => {
				if(err){
					if(res) {
						console.log(res.body.errors[0].detail);
						return gatherMsgs(msg, i, end, iter+1);
					} else {
						console.log(err);
						return gatherMsgs(msg, i, end, iter+1);
					}
					return msg;
				} else {
					msg = msg.concat(getMessage(res.body));
					console.log(msg.length);
					return gatherMsgs(msg, i+1, end, 0);
				}
			});
	}
}

/*const gatherMsgs = (time) => {
	let msg = [];

	for(let i=time.start; i < time.end; i++){
		request
			.get(url.replace("VIDID", video_id).replace("TIME", i))
			.end((err, res) => {
				if(err){
					console.log(JSON.stringify(err));
					process.exit(1);
				} else {
					msg.concat(getMessage(res.body));
					if(i + 1 == time.end) {
						console.log(msg.length);
					}
				}
			});
	}

	request
		.get(url.replace("VIDID", video_id).replace("TIME", time.start))
		.end((err, res) => {
			if(err){
				console.log(JSON.stringify(err));
				process.exit(1);
			} else {
				process(res.body);
			}
		});
}*/

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

	//msg = ['OMFG ROFLMAO WTF IS HAPPENING LOL']

	let oldMsg = msg.slice();

	msg = removePattern(msg, usernamePattern);
	msg = removePattern(msg, urlPattern);
	msg = toLower(msg);
	msg = changeAbbrev(msg);
	msg = toExtend(msg);
	msg = removePattern(msg, nonAlphaNumPattern);

	msg = normalize(msg);
	msg = removeNounAndArticles(msg);

	for(let i=0; i < msg.length; i++) {
		console.log("new: " + msg[i] + "\nold: " + oldMsg[i] + "\n");
	}

	console.log("Length: " + msg.length);

	//console.log(JSON.stringify(nlp.text('its happening').tags()));
}

const removePattern = (msg, pattern) => {
	let msg2 = [];
	
	for(let i=0; i < msg.length; i++) {
		let str = msg[i].replace(pattern, '');
		msg2.push(str);
	}

	return msg2;
}

const normalize = (msg) => {
	for(let i=0; i < msg.length; i++) {
		msg[i] = nlp.text(msg[i]).root();
	}

	return msg;
}

const toExtend = (msg) => {
	for(let i=0; i < msg.length; i++) {
		msg[i] = nlp.text(msg[i]).contractions.expand().text();
	}

	return msg;
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
		for(let j=0; j < words.length; j++) {
			let replaced = false;
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

					for(let k=0; k < dict.swears.length; k++) {
						if(words[j] === dict.swears[k]){
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

start();