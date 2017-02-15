'use strict';

const fs = require('fs');

const input = [__dirname + '/selected/csgo.txt', __dirname + '/selected/dota2.txt', __dirname + '/selected/lol.txt'];
const output = [__dirname + '/selected/csgo_format.txt', __dirname + '/selected/dota2_format.txt', __dirname + '/selected/lol_format.txt'];

const start = () => {

	for(let i=0; i<3; i++) {
		fs.writeFileSync(output[i], '');
		format(input[i], output[i]);
	}
}

const format = (input, output) => {
	fs.readFile(input, 'utf8', (err, data) => {
		if(!err) {
			let data_split = data.split('\n');

			for(let i=0; i<data_split.length; i++) {
				fs.appendFileSync(output, data_split[i] + '\n');
				if((i+1)%25 == 0) {
					fs.appendFileSync(output, '\n');
				}
			}
		} else {
			console.log(input + ' ' + output + ' ' + err);
		}
	});
}

start();