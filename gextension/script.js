(function() {
	const chat_url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=vVIDID';
	const local_url = 'https://localhost:3000';

    const amuse_col         = '#0F0';
    const neutral_col       = '#CCC';
    const pathetic_col      = '#00F';
    const infuriating_col   = '#F00';

    let vid_id = window.location.pathname.split('/')[2];
    let svg_svm, svg_bayes;
    let rect_width;

    let sendMessagesBayes = function(msgs, i) {
        $.ajax({
            method: 'POST',
            url: local_url + '/naive_bayes',
            data: {
                data: JSON.stringify(msgs)
            }
        }).done(function(data) {
            let classes = JSON.parse(data.data);
            let color;

            

            color = getMaxSentimentColor(classes);
            drawRect(i, amuse_col, svg_bayes);
        }).fail(function(jqXHR, msg) {
            console.log(JSON.stringify(jqXHR));
        })
    }

    let sendMessagesSVM = function(msgs, i) {
        $.ajax({
            method: 'POST',
            url: local_url + '/svm',
            data: {
                data: JSON.stringify(msgs)
            }
        }).done(function(data) {
            let classes = JSON.parse(data.data);
            let color;

            color = getMaxSentimentColor(classes);
            drawRect(i, color, svg_svm);
        }).fail(function(jqXHR, msg) {
            console.log(JSON.stringify(jqXHR));
        })
    }

    let getMaxSentimentColor = function(classes) {
        let max = 0, maxIndex;

        Object.keys(classes).forEach(function(key, index) {
            if(key === 'total' || key === 'unclassified') {
                return;
            } else {
                if(max < classes[key]) {
                    max = classes[key];
                    maxIndex = key;
                }
            }
        });

        switch(maxIndex) {
            case 'amusing':     return amuse_col;
            case 'neutral':     return neutral_col;
            case 'pathetic':    return pathetic_col;
            default: return infuriating_col;
        }
    }

    let getMessages = function(vid_id, start, end, i) {
        $.ajax({
            method: 'GET',
            url: chat_url.replace('VIDID', vid_id).replace('TIME', start)
        }).fail(function(jqXHR, msg){
            let msgSplit = JSON.parse(jqXHR.responseText).errors[0].detail.split(' ');

            getMessages(vid_id, parseInt(msgSplit[4]), parseInt(msgSplit[6]), 0);
            getRectWidth(parseInt(msgSplit[4]), parseInt(msgSplit[6]));
        }).done(function(data) {
            let msgs = [];

            data.data.forEach(function(e, index) {
                if(!e.attributes.deleted && e.attributes.from !== 'moobot') 
                    msgs.push(e.attributes.message);
            })

            sendMessagesBayes(msgs, i);
            sendMessagesSVM(msgs, i);

            if(start <= end) {
                getMessages(vid_id, start+30, end, i+1);
            }
        });
    }

    let getUsername = function() {
        return document.title.replace(' - Twitch', '').trim();
    }

    let drawRect = function(index, color, draw) {

        draw.rect(rect_width + '%', 50).attr({
            fill: color,
            x: index*rect_width + '%',
            y: 0
        });
    }

    let getRectWidth = function(start, end) {
        let length = end - start;
        let n = length/30 + ((length%30 === 0)? 0: 1);

        rect_width = 100/n;

        console.log('Retrieving chat messages');
    }

    let insertTag = function() {
        if($('div#channel > div.mg-b-2').length) {
            $('div#channel > div.mg-b-2').append('<div id=\'annotator-bayes\'></div>');
            $('div#channel > div.mg-b-2').append('<div id=\'drawer-bayes\'></div>');
            $('div#channel > div.mg-b-2').append('<div id=\'annotator-svm\'></div>');
            $('div#channel > div.mg-b-2').append('<div id=\'drawer-svm\'></div>');
            $('div#channel > div.mg-b-2').append('<div id=\'legend\'></div>');

            $('div#annotator-bayes').html('Naive Bayes');
            $('div#annotator-svm').html('SVM');
            $('div#legend').html('Legend: <br>' + 
                'Green - Amusing <br />' + 
                'Gray - Neutral <br />' + 
                'Blue - Pathetic <br />' + 
                'Red - Infuriating'
            );

            getMessages(vid_id, 0, 0, 0);

            svg_bayes = SVG('drawer-bayes').size('100%', 50);
            svg_svm = SVG('drawer-svm').size('100%', 50);

            svg_bayes.rect('100%', 50).attr({fill: '#CCC'});
            svg_svm.rect('100%', 50).attr({fill: '#CCC'});
        } else {
            setTimeout(function() {
                insertTag();
            }, 500);
        }
    }

    insertTag();
})();