'use strict';

const fs = require('fs');

const BULLDOG = 'chat_messages/bulldog.txt';
const NIGHTBLUE3 = 'chat_messages/nightblue3.txt';
const ADREN = 'chat_messages/adren.txt';
const FILE_NAME = 'chats.txt';

const start = () => {
	let bulldog = fs.readFileSync(BULLDOG, 'utf-8').split('\n');
	let nightblue3 = fs.readFileSync(NIGHTBLUE3, 'utf-8').split('\n');
	let adren = fs.readFileSync(ADREN, 'utf-8').split('\n');

	fs.writeFile(FILE_NAME, '');

	for(let i=0; i<1000; i++) {
		let index = 0;

		index = Math.floor(Math.random() * bulldog.length);
		fs.appendFileSync(FILE_NAME, bulldog[index] + '\n');
		bulldog.splice(index, 1);

		index = Math.floor(Math.random() * nightblue3.length);
		fs.appendFileSync(FILE_NAME, nightblue3[index] + '\n');
		nightblue3.splice(index, 1);

		index = Math.floor(Math.random() * adren.length);
		fs.appendFileSync(FILE_NAME, adren[index] + '\n');
		adren.splice(index, 1);
	}

	console.log('done!');
}

start();