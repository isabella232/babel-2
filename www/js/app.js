$(function() {
    var hash = window.location.hash.replace('#', '');
    var story_id = hash.split('/')[0];
    var slug = hash.split('/')[1];

    if (!story_id) {
        story_id = '167664846';
        window.location.hash = '#' + story_id;
    }

    var $player = $('#pop-audio');
    var $title = $('h1');
    var $transcript = $('#transcript');
    var $program_name = $('#program-name');
    var $play_link = $('#play-link');
    var $datestamp = $('#story-meta').find('.dateblock');

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
		$.getJSON('transcripts/' + story_id + '.json', function(transcript) {
            $title.text(transcript['title']);
            $datestamp.text(transcript['program_date']);
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
                            window.location.hash = '#' + story_id + '/' + fragment['slug'];
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
        
        $play_link.click(function() {
			$player.jPlayer('play', 0);
		});
	}

    init();
});
