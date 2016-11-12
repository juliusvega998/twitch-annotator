'use strict';

const request = require('superagent');
const http = require('http');
const nlp = require('nlp_compromise');
const fs = require('fs');
const dict = require(__dirname + '/dictionary')

const url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=vVIDID';
const video_id = '99986788';

const MAX_ITER = 10000;
const TIME_OUT = 500;
const INCREMENT = 30;

let msgs = [];
let done = false;

const start = () => {
	fs.writeFile('message.txt', '');

	gatherTimePeriod();
	extract(0);
}

const gatherTimePeriod = () => {
	request
		.get(url.replace("VIDID", video_id).replace("TIME", 0))
		.end((err, res) => {
			if(err){
				let toks = res.body.errors[0].detail.split(' ');
				mark = parseInt(toks[4]);
				gatherMsgs(parseInt(toks[4]), parseInt(toks[6]), 0);
				//gatherMsg(parseInt(toks[4]), parseInt(toks[6]), 0);
			}
		});
}

const gatherMsgs = (i, end, iter) => {
	if(i >= end) {
		done = true;
	} else if(iter >= MAX_ITER) {
		done = true;
		console.log("Maximum tries reached.");
	} else {
		request
			.get(url.replace("VIDID", video_id).replace("TIME", i))
			.end((err, res) => {
				if(err){
					if(res) {
						console.log(res.body.errors[0].detail);
					} else {
						console.log(err);
					}
					setTimeout(() => {
						gatherMsgs(i, end, iter+1);
					}, TIME_OUT);
				} else {
					msgs = msgs.concat(getMessage(res.body));
					gatherMsgs(i+INCREMENT, end, 0);
				}
			});
	}
}

const gatherMsg = (i, end, iter) => {
	request
		.get(url.replace("VIDID", video_id).replace("TIME", i))
		.end((err, res) => {
			if(err){
				if(res) {
					console.log(res.body.errors[0].detail);
				} else {
					console.log(err);
				}
				setTimeout(() => {
					gatherMsgs(i, end, iter+1);
				}, TIME_OUT);
			} else {
				let msgs2 = getMessage(res.body);
				if(msgs2) {
					msgs = msgs.concat(msgs2);
					fs.appendFile('time.txt', "\n", function(err) {
						if(err) {
							console.log(err);
						}
					});
				}

				done = true;
			}
		});
}

const getMessage = (body) => {
	let msg = [];

	for(let i=0; i < body.data.length; i++) {
		if(!body.data[i].attributes.deleted) {
			msg.push(body.data[i].attributes.message);
		}
	}

	return msg;
}

const extract = (i) => {
	if(msgs.length) {
		let msg = msgs.shift();
		process(msg);
		extract(i+1);
	} else {
		if(!done) {
			setTimeout(() => {
				extract(i);
			}, TIME_OUT);
		}
	}
}

const process = (msg) => {
	preprocess(msg);
}

const preprocess = (msg) => {
	let usernamePattern = /@[A-Za-z0-9]+/g;
	let urlPattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
	let nonAlphaNumPattern = /[^a-zA-Z0-9 ]+/g;

	let oldMsg = msg;
	let str = "";

	msg = removePattern(msg, usernamePattern);
	msg = removePattern(msg, urlPattern);
	msg = toLower(msg);

	msg = changeAbbrev(msg);
	msg = toExtend(msg);
	msg = removePattern(msg, nonAlphaNumPattern);

	msg = removeNounAndArticles(msg);
	msg = normalize(msg);

	str = "new: " + msg + "\nold: " + oldMsg + "\n\n";

	fs.appendFile('message.txt', str, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log(str);
		}
	});
}

const removePattern = (msg, pattern) => {
	return msg.replace(pattern, '');
}

const normalize = (msg) => {
	let words = msg.split(' ');
	let words2 = [];

	for(let i=0; i < words.length; i++) {
		let isEmoticon = false;
		for(let j=0; j < dict.emoticons.length; j++) {
			if(words[i] === dict.emoticons[j]){
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
				for(let k=0; k < dict.emoticons.length; k++) {
					if(words[j] === dict.emoticons[k]){
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

start();
//process('4Head');