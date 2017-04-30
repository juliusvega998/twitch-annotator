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
	PORT: 3000,
	IP: '127.0.0.1',
	emoticons: get_emoticons(),
	abbreviated: [
		{
			short: 'af',
			long: 'as fuck',
		},{
			short: 'afk',
			long: 'away from keyboard',
		},{
			short: 'brb',
			long: 'be right back',
		},{
			short: 'btw',
			long: 'by the way',
		},{
			short: 'bff',
			long: 'best friends forever',
		},{
			short: 'cn',
			long: 'china'
		},{
			short: 'cs',
			long: 'creep score'
		},{
			short: 'dmg',
			long: 'damage'
		},{
			short: 'eu',
			long: 'europe'
		},{
			short: 'ez',
			long: 'easy'
		},{
			short: 'feelsbadman',
			long: 'feels bad man',
		},{
			short: 'feelsgoodman',
			long: 'feels good man',
		},{
			short: 'ftw',
			long: 'for the win',
		},{
			short: 'gg',
			long: 'good game',
		},{
			short: 'ggwp',
			long: 'good game well played',
		},{
			short: 'gl',
			long: 'good luck',
		},{
			short: 'glhf',
			long: 'good luck have fun',
		},{
			short: 'gpa',
			long: 'grade point average',
		},{
			short: 'gr8',
			long: 'great',
		},{
			short: 'hahaa',
			long: 'haha',
		},{
			short: 'imho',
			long: 'in my honest opnion',
		},{
			short: 'irl',
			long: 'in real life',
		},{
			short: 'jk',
			long: 'just kidding',
		},{
			short: 'lmao',
			long: 'laughing my ass off',
		},{
			short: 'lol',
			long: 'laugh out loud',
		},{
			short: 'lul',
			long: 'laugh out loud',
		},{
			short: 'mvp',
			long: 'most valuable player'
		},{
			short: 'na',
			long: 'north america'
		},{
			short: 'np',
			long: 'no problem',
		},{
			short: 'nt',
			long: 'nice try',
		},{
			short: 'nub',
			long: 'noob',
		},{
			short: 'oic',
			long: 'oh i see',
		},{
			short: 'omg',
			long: 'oh my god',
		},{
			short: 'omfg',
			long: 'oh my fucking god',
		},{
			short: 'pls',
			long: 'please',
		},{
			short: 'rn',
			long: 'right now',
		},{
			short: 'roflmao',
			long: 'rolling on the floor laughing my ass off',
		},{
			short: 'smth',
			long: 'something',
		},{
			short: 'stfu',
			long: 'shut the fuck up'
		},{
			short: 'thx',
			long: 'thanks',
		},{
			short: 'tfw',
			long: 'that feel when',
		},{
			short: 'tmw',
			long: 'that moment when',
		},{
			short: 'usa',
			long: 'united states of america'
		},{
			short: 'vs',
			long: 'versus',
		},{
			short: 'wtf',
			long: 'what the fuck',
		},{
			short: 'wth',
			long: 'what the hell',
		}
	],
	swears: [
		'fuck',
		'fucking',
		'fuckin',
		'shit',
		'goddamn',
		'damn',
		'ass',
		'asshole',
		'cunt'
	]
}