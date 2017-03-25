'use strict';

exports.hello = (req, res, next) => {
	return res.send({message: "Hello World!"});
}

