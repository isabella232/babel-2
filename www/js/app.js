$(function() {
    var slug = window.location.hash.replace('#', '');

    var $player = $('#pop-audio');
    var $title = $('h1');
    var $transcript = $('#transcript');
    var $program_name = $('#program-name');

    // Setup jplayer
    $player.jPlayer({
        ended: function (event) {
            $(this).jPlayer("pause");
        },
        swfPath: "js",
        supplied: "mp3"
    });

    // Setup popcorn
    pop = Popcorn('#jp_audio_0');

	function init() {
        /*
         * Fetch the transcript json and render it.
         */
		$.getJSON('transcript.json', function(transcript) {
            $title.text(transcript['title']);
            $program_name.text(transcript['program']);

            $player.jPlayer('setMedia', {
                mp3: transcript['mp3_url'] 
            }).jPlayer("pause");

			$.each(transcript['turns'], function(k, turn) {
                var speaker = transcript['speakers'][turn['speaker_id']];
                var html = JST.turn($.extend({}, turn, { 'speaker': speaker }));
                var $turn = $(html).appendTo($transcript);

                $.each(turn['fragments'], function(k2, fragment) {
                    var $fragment = $turn.find('#fragment-' + fragment['slug']); 

                    pop.code({
                        start: fragment['offset'],
                        end: fragment['offset'] + .5,
                        onStart: function(options) {         
                            window.location.hash = '#' + fragment['slug'];
                            $('#transcript p.quote').removeClass('active');
                            $fragment.addClass('active');
                            return false;
                        } 
                    });
                });
			});

            $transcript.find('p.quote').click(function() {
                var offset = $(this).data('offset');

                $player.jPlayer('play', offset);
            });

            if (slug) {
                var $fragment = $('#fragment-' + slug);
                $fragment.click();
            }
        });
	}

    init();
});
