'use strict';

const request = require('superagent');
const error = require(__dirname + '/error');

const get_emoticons = () => {
	return new Promise((resolve, reject) => {
		request
			.get('https://twitchemotes.com/api_cache/v2/global.json')
			.end((err, res) => {
				if(err) {
					reject(err);
				} else {
					let key = Object.keys(res.body.emotes);
					resolve(key);
				}
			});
	});
}

module.exports = {
	PORT: 8000,
	IP: '127.0.0.1',
	emoticons: get_emoticons().then(
		(result) => {
			return result;
		}, (error) => {
			process.exit(error.NO_EMOTICONS);
		}
	)
}