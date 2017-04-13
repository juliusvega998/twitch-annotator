(function() {
	const url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=vVIDID';
	const local_url = 'https://localhost:3000';
    let vid_id = window.location.pathname.split('/')[2];

    let sendMessages = function(msgs) {
        $.ajax({
            method: 'POST',
            url: local_url + '/naive_bayes',
            data: {
                data: JSON.stringify(msgs)
            }
        }).done(function(data) {
            console.log(data.data);
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

            sendMessages(msgs);
            if(start <= end) {
                getMessages(vid_id, start+30, end);
            }
        });
    }

    console.log('Retrieving chat messages');
    getMessages(vid_id, 0, 0);
})();