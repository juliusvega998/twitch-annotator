'use strict';

const importer = require('anytv-node-importer');

module.exports = (router) => {
	const __ = importer.dirloadSync(__dirname + '/../controller');

	__.controller.init();

	router.del = router.delete;

	router.get('/', __.controller.hello);
	//router.post('/preprocess', __.controller.preprocess_all);
	router.post('/naive_bayes', __.controller.naive_bayes);

	return router;
}