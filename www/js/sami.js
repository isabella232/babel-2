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
		$.getJSON('transcripts/' + story_id + '.smi.json', function(transcript) {
            $title.text(transcript['title']);
            //$datestamp.text(transcript['program_date']);
            //$program_name.text(transcript['program']);

            $player.jPlayer('setMedia', {
                mp3: transcript['mp3_url'] 
            }).jPlayer("pause");

            Popcorn.destroy(pop);
            pop = Popcorn('#jp_audio_0');

            $transcript.empty();

			$.each(transcript['turns'], function(k, turn) {
                var html = JST.sami_turn($.extend({}, turn));
                var $turn = $(html).appendTo($transcript);

                _.each(turn['fragments'], function(fragment) {
                    pop.code({
                        start: fragment['offset'] / 1000,
                        end: fragment['offset'] / 1000 + 500,
                        onStart: function(options) {
                            router.navigate('#' + story_id + '/' + fragment['slug']);

                            var $fragment = $('#fragment-' + fragment['slug']);

                            $('span.quote.active').removeClass('active');
                            $fragment.addClass('active');

                            $("html, body").animate({
                                scrollTop: $fragment.offset().top - $(window).height() / 2 + $fragment.height() / 2 + 15
                            }, 1000);

                            return false;
                        } 
                    });
                });
			});

            $transcript.find('span.quote').click(function() {
                var offset = parseInt($(this).data('offset')) / 1000;

                console.log(offset);

                $player.jPlayer('pause');
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
            ':story_id/:slug':  'goto_story',
        },

        goto_story: function(story_id, slug) {
            if (!story_id) {
                story_id = 'TEDRadioHour';
            }

            init(story_id, slug); 
        }
    });

    var router = new TranscriptRouter();
    Backbone.history.start();
});
