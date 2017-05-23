# Twitch Annotator

## Prerequisites
1. NodeJS
```bash
$ sudo apt-get install npm
$ sudo npm install n -g
$ sudo n stable
```
2. Bower
```bash
$ sudo npm install bower -g
```
3. Google Chrome
4. Self Signed Certificate - used this [site](http://www.thegeekstuff.com/2009/07/linux-apache-mod-ssl-generate-key-csr-crt-file) as a reference

## Running the Application
### Installing Dependencies
1. Open the terminal
2. Run `sudo npm install nodemon -g`
3. Go to gextension folder
4. Run `bower install`
5. Go to the server folder
6. Run `npm install`

### Installing the Google Chrome Extension
1. Open Google Chrome and go to chrome://extensions
2. Click "Load unpacked extension..."
3. Open the gextension folder

### Initializing the Server
1. Go to the server folder using the terminal
2. Run `npm start`
3. Wait for Naive Bayes and SVM to finish training
4. Open Google Chrome and go to "https://localhost:3000"
5. If Google Chrome blocked the access to the website, go to Advanced > Proceed to localhost (unsafe). You have to do this once every few days.

### Using the Chrome Extension
1. Go to the past broadcast of a twitch user. An example of such past broadcast is [this](https://www.twitch.tv/videos/83400929).
   * If the two bars below the site is not shown, try refreshing the page.
2. Wait for the bars to be full.

## Server API

* `/preprocess`
  * Used to preprocess the chat messages before they are classified.
  * Uses `POST` method and requires a `message` in request payload.
  * Returns the preprocessed message inside `message` in response payload.
* `/naive_bayes`
  * Used to classify the chat messages using the Naive Bayes Classifier.
  * Preprocesses the message before they are classified
  * Uses `POST` method and requires a 'data' in request payload in an array stringified using `JSON.stringify()`.
  * Returns a JSON object stringified using `JSON.stringify()` and holds the number of chat messages for each classification.
* `/svm`
  * Used to classify the chat messages using Support Vector Machine.
  * Preprocesses the message before they are classified
  * Uses `POST` method and requires a 'data' in request payload in an array stringified using `JSON.stringify()`.
  * Returns a JSON object stringified using `JSON.stringify()` and holds the number of chat messages for each classification.
