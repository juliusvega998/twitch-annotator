(function() {
	const url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=vVIDID';
	const local_url = 'https://localhost:3000';

    const result = {
        amusing: 0,
        neutral: 0,
        pathetic: 0,
        infuriating: 0
    }

    let vid_id = window.location.pathname.split('/')[2];

    let sendMessagesBayes = function(msgs) {
        $.ajax({
            method: 'POST',
            url: local_url + '/naive_bayes',
            data: {
                data: JSON.stringify(msgs)
            }
        }).done(function(data) {
            let classes = JSON.parse(data.data);
            result.amusing += classes.amusing;
            result.neutral += classes.neutral;
            result.pathetic += classes.pathetic;
            result.infuriating += classes.infuriating;

            $('div#annotator-bayes').html(
                "Naive Bayes" + "<br />" +
                "Amusing: " + result.amusing + "<br />" +
                "Neutral: " + result.neutral + "<br />" +
                "Pathetic: " + result.pathetic + "<br />" +
                "Infuriating: " + result.amusing + "<br />"
            )
        }).fail(function(jqXHR, msg) {
            console.log(JSON.stringify(jqXHR));
        })
    }

    let sendMessagesSVM = function(msgs) {
        $.ajax({
            method: 'POST',
            url: local_url + '/svm',
            data: {
                data: JSON.stringify(msgs)
            }
        }).done(function(data) {
            let classes = JSON.parse(data.data);
            
            result.amusing += classes.amusing;
            result.neutral += classes.neutral;
            result.pathetic += classes.pathetic;
            result.infuriating += classes.infuriating;

            $('div#annotator-svm').html(
                "SVM" + "<br />" +
                "Amusing: " + result.amusing + "<br />" +
                "Neutral: " + result.neutral + "<br />" +
                "Pathetic: " + result.pathetic + "<br />" +
                "Infuriating: " + result.amusing + "<br />"
            )
        }).fail(function(jqXHR, msg) {
            console.log(JSON.stringify(jqXHR));
        })
    }

    let getMessages = function(vid_id, start, end) {
        $.ajax({
            method: 'GET',
            url: url.replace('VIDID', vid_id).replace('TIME', start)
        }).fail(function(jqXHR, msg){
            let msgSplit = JSON.parse(jqXHR.responseText).errors[0].detail.split(' ');

            getMessages(vid_id, parseInt(msgSplit[4]), parseInt(msgSplit[6]));
        }).done(function(data) {
            let msgs = [];

            data.data.forEach(function(e, index) {
                if(!e.attributes.deleted && e.attributes.from !== 'moobot') 
                    msgs.push(e.attributes.message);
            })

            sendMessagesBayes(msgs);
            sendMessagesSVM(msgs);
            if(start <= end) {
                getMessages(vid_id, start+30, end);
            }
        });
    }

    console.log('Retrieving chat messages');


    let insertTag = function() {
        if($('div#channel > div.mg-b-2').length) {
            $('div#channel > div.mg-b-2').append('<div id=\'annotator-bayes\'></div>');
            $('div#channel > div.mg-b-2').append('<div id=\'annotator-svm\'>Hello World!</div>');
        } else {
            setTimeout(function() {
                insertTag();
            }, 500);
        }
    }

    insertTag();
    getMessages(vid_id, 0, 0);
})();