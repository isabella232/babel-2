$(function() {
    var $player = $('#pop-audio');

    $player.jPlayer({
        ready: function () {
            $(this).jPlayer('setMedia', {
                // TODO - load dynamically
                mp3: "http://pd.npr.org/anon.npr-mp3/npr/me/2012/11/20121130_me_12.mp3"
            }).jPlayer("pause");
        },
        play: function() { // To avoid both jPlayers playing together.
            $(this).jPlayer("pauseOthers");
        },
        ended: function (event) {
            $(this).jPlayer("pause");
        },
        swfPath: "js",
        supplied: "oga, mp3"
    });

    // associate jPlayer with Popcorn
    pop = Popcorn('#jp_audio_0');

	function load_transcript() {
		$.getJSON('transcript.json', function(data) {
			$.each(data['fragments'], function(k, v) {
                pop.code({
                    start: v['offset'],
                    end: v['offset'] + .5,
                    onStart: function( options ) {         
                        $('#transcript').text(v['text']);
                        return false;
                    },
                    onEnd: function( options ) {}
                });
			});
        });
	}

    load_transcript();
});
