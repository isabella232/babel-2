$(function() {
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
    var pop = Popcorn('#jp_audio_0');

	function init(story_id, slug) {
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

            Popcorn.destroy(pop);
            pop = Popcorn('#jp_audio_0');

            var previous_speaker = {};

            $transcript.empty();

			$.each(transcript['turns'], function(k, turn) {
                var speaker_id = turn['speaker_id'];
                var speaker = transcript['speakers'][speaker_id];
                var html = JST.turn($.extend({}, turn, { 'speaker': speaker, 'new_speaker': _.isUndefined(previous_speaker[speaker_id]) }));
                previous_speaker[speaker_id] = true;
                var $turn = $(html).appendTo($transcript);

                $.each(turn['fragments'], function(k2, fragment) {
                    var $fragment = $turn.find('#fragment-' + fragment['slug']); 

                    pop.code({
                        start: fragment['offset'],
                        end: fragment['offset'] + .5,
                        onStart: function(options) {
                            router.navigate('#' + story_id + '/' + fragment['slug']);

                            $('#transcript li').removeClass('speaking');
                            $('#transcript p.quote').removeClass('active');
                            $fragment.addClass('active');
                            $fragment.parent().addClass('speaking');

							$("html, body").animate({
								scrollTop: $fragment.offset().top - $(window).height() / 2 + $fragment.height() / 2 + 15
							}, 1000);

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

    var TranscriptRouter = Backbone.Router.extend({
        routes: {
            '':                 'goto_story',
            ':story_id':        'goto_story',
            ':story_id/:slug':  'goto_story'
        },

        goto_story: function(story_id, slug) {
            if (!story_id) {
                story_id = '167664846';
            }

            init(story_id, slug); 
        }
    });

    var router = new TranscriptRouter();
    Backbone.history.start();
});
