'use strict';

const importer = require('anytv-node-importer');

module.exports = (router) => {
	const __ = importer.dirloadSync(__dirname + '/../controller');

	__.controller.init();

	router.del = router.delete;

	router.get('/', __.controller.hello); //used to check if the server is up and running
	router.post('/preprocess', __.controller.preprocess); //API for preprocessing the chat message
	router.post('/naive_bayes', __.controller.naive_bayes); //API to classify the chat message using the Naive Bayes Classifier
	router.post('/svm', __.controller.support_vector); //API to classify the chat message using Support Vector Machine

	return router;
}