'use strict';

const request = require('superagent');
const http = require('http');
const nlp = require('nlp_compromise');
const fs = require('fs');
const dict = require(__dirname + '/dictionary')

const url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=vVIDID';
const video_ids = ['97690975','83400929','116549596'];

const MAX_ITER = 10000;
const TIME_OUT = 500;
const INCREMENT = 30;
const FILE_NAME = [__dirname + '/raw/lol.txt', __dirname + '/raw/dota2.txt', __dirname + '/raw/csgo.txt'];

let msgs = [];
let done = false;

const start = (i) => {
	fs.writeFile(FILE_NAME[i], '');
	gatherTimePeriod(i);
	extract(0, i);
}

const gatherTimePeriod = (i) => {
	request
		.get(url.replace("VIDID", video_ids[i]).replace("TIME", 0))
		.end((err, res) => {
			if(err){
				let toks = res.body.errors[0].detail.split(' ');
				gatherMsgs(parseInt(toks[4]), parseInt(toks[6]), 0, i);
			}
		});
}

const gatherMsgs = (i, end, iter, id) => {
	if(i >= end) {
		done = true;
	} else if(iter >= MAX_ITER) {
		done = true;
		console.log("Maximum tries reached.");
	} else {
		request
			.get(url.replace("VIDID", video_ids[id]).replace("TIME", i))
			.end((err, res) => {
				if(err){
					if(res) {
						console.log(res.body.errors[0].detail + ' ' + id);
					} else {
						console.log(err);
					}
					setTimeout(() => {
						gatherMsgs(i, end, iter+1, id);
					}, TIME_OUT);
				} else {
					msgs = msgs.concat(getMessage(res.body));
					gatherMsgs(i+INCREMENT, end, 0, id);
				}
			});
	}
}

const getMessage = (body) => {
	let msg = [];

	for(let i=0; i < body.data.length; i++) {
		if(!body.data[i].attributes.deleted || body.data[i].attributes.from !== 'moobot') {
			msg.push(body.data[i].attributes.message);
		}
	}

	return msg;
}

const extract = (i, file) => {
	if(msgs.length) {
		let msg = msgs.shift();

		process(msg, file);
		extract(i+1, file);
	} else {
		if(!done) {
			setTimeout(() => {
				extract(i, file);
			}, TIME_OUT);
		}
	}
}

const process = (msg, file) => {
	preprocess(msg, file);
	/*fs.appendFile(FILE_NAME[file], msg + '\n', function(err) {
		if(err) {
			console.log(err)
		} else {
			console.log(msg)
		}
	});*/
}

const preprocess = (msg, file) => {
	let usernamePattern = /@[A-Za-z0-9]+/g;
	let commandPattern = /![A-Za-z0-9]+/g;
	let urlPattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
	let nonAlphaNumPattern = /[^a-zA-Z0-9 ]+/g;

	let oldMsg = msg;
	let str = "";

	msg = removePattern(msg, usernamePattern);
	msg = removePattern(msg, commandPattern);

	if(msg) {
		fs.appendFile(FILE_NAME[file], msg + '\n', function(err) {
			if(err) {
				console.log(err)
			} else {
				console.log(msg)
			}
		});
	}

	/*msg = removePattern(msg, urlPattern);
	msg = toLower(msg);

	msg = changeAbbrev(msg);
	msg = toExtend(msg);
	msg = removePattern(msg, nonAlphaNumPattern);

	msg = removeNounAndArticles(msg);
	msg = normalize(msg);

	str = "new: " + msg + "\nold: " + oldMsg + "\n\n";*/

	/*fs.appendFile('message.txt', str, function(err) {
		if(err) {
			console.log(err);
		}
	});*/
	console.log(str);
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
				for(let k=0; k < dict.emoticons.length; k++) {
					if(words[j] === dict.emoticons[k]){
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

start(2);