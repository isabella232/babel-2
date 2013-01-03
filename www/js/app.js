$(function() {
    var $player = $('#pop-audio');

    $player.jPlayer({
        ready: function () {
        },
        ended: function (event) {
            $(this).jPlayer("pause");
        },
        swfPath: "js",
        supplied: "mp3"
    });

    // associate jPlayer with Popcorn
    pop = Popcorn('#jp_audio_0');

	function load_transcript() {
		$.getJSON('transcript.json', function(transcript) {
            $('h1').text(transcript['title']);

            $player.jPlayer('setMedia', {
                mp3: transcript['mp3_url'] 
            }).jPlayer("pause");

			$.each(transcript['turns'], function(k, turn) {
                var speaker = transcript['speakers'][turn['speaker_id']];

                $.each(turn['fragments'], function(k2, fragment) {
                    pop.code({
                        start: fragment['offset'],
                        end: fragment['offset'] + .5,
                        onStart: function( options ) {         
                            $('#speaker').text(speaker['name']);
                            $('#speaker-description').text(speaker['description']);
                            $('#transcript').text(fragment['text']);
                            return false;
                        },
                        onEnd: function( options ) {}
                    });
                });
			});
        });
	}

    load_transcript();
});
