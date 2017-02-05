'use strict';

const fs = require('fs');

const input = [__dirname + '/raw/csgo.txt', __dirname + '/raw/dota2.txt', __dirname + '/raw/lol.txt'];
const output = [__dirname + '/selected/csgo.txt', __dirname + '/selected/dota2.txt', __dirname + '/selected/lol.txt'];
const chat_number = 500
let msgs = [];

const start = () => {
	let raw = [];

	console.log("started!");

	for(let i=0; i<3; i++) {
		raw.push(fs.readFileSync(input[i], 'utf-8').split('\n'));
		fs.writeFile(output[i], '');
	}

	for(let i=0; i<chat_number; i++) {
		for(let j=0; j<3; j++) {
			let index = 0;
			
			index = Math.floor(Math.random() * raw[j].length);
			if(checkAdded(raw[j][index])) {
				raw[j].splice(index, 1);
				j--;
			} else {
				fs.appendFileSync(output[j], raw[j][index] + '\n');
				msgs.push(raw[j][index]);
				raw[j].splice(index, 1);
			}
		}
	}

	console.log('done!');
}

const checkAdded = (msg) => {
	for(let i=0; i<msgs.length; i++) {
		if(msg.toLowerCase() === msgs[i].toLowerCase()) {
			return true;
		}
	}

	return false;
}

start();