'use strict';

const request = require('superagent');
const chat_url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=v83400929';
const local_url = 'https://localhost:3000';

const getMessages = function(start, end, i) {
	request
		.get(chat_url.replace('TIME', start))
		.end((err, res) => {
			if(err) {
				let msgSplit = JSON.parse(err.response.error.text).errors[0].detail.split(' ');
				getMessages(parseInt(msgSplit[4]), parseInt(msgSplit[6]), 0);
			} else {
				let msgs = [];

				res.body.data.forEach(function(e, index) {
					if(!e.attributes.deleted && e.attributes.from !== 'moobot') 
						msgs.push(e.attributes.message);
				});

				sendSVM(msgs);

				if(start <= end) {
					getMessages(start+30, end, i+1);
				}
			}
		})
}

const sendSVM = function(msgs) {
	request
		.post(local_url + '/svm')
		.send({data: JSON.stringify(msgs)})
		.end((err, res) => {
			if(err) {
				console.log(err);
				console.log('ERROR!');
			} else {
				console.log(JSON.parse(res.body.data));

			}
		})
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
getMessages(0, 10, 0);