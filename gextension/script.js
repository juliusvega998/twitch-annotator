(function() {
	const url = 'https://rechat.twitch.tv/rechat-messages?start=TIME&video_id=vVIDID';
	const local_url = 'http://localhost:8000';
    let vid_id = window.location.pathname.split('/')[1];

    console.log('Retrieving chat messages');
    console.log('Video ID:' + vid_id);
    /*$.ajax({
    	method: 'GET',
    	url: url.replace('VIDID', vid_id).replace('TIME', 0))
    }).fail(function(jqXHR, msg){
    	console.log(JSON.stringify(msg));
    }).done(function(data) {
    	console.log("success??");
    	console.log(JSON.stringify(data));
    });*/
})();