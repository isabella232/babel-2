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
                    var html = JST.fragment($.extend({}, fragment, { 'speaker': speaker }));
                    var $fragment = $(html).appendTo($('#transcript'));

                    pop.code({
                        start: fragment['offset'],
                        end: fragment['offset'] + .5,
                        onStart: function( options ) {         
                            $('#transcript li').css('background-color', '#fff');
                            $fragment.css('background-color', '#fcc');

                            return false;
                        },
                        onEnd: function( options ) {}
                    });
                });
			});

            $('#transcript li').click(function() {
                var offset = $(this).data('offset');

                $player.jPlayer('play', offset);
            });
        });
	}

    load_transcript();
});
