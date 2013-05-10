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

			$.each(transcript['syncs'], function(k, sync) {
                var html = JST.sync($.extend({}, sync));
                var $sync = $(html).appendTo($transcript);

                console.log(sync['offset']);

                pop.code({
                    start: sync['offset'] / 1000,
                    end: sync['offset'] / 1000 + 500,
                    onStart: function(options) {
                        console.log('start');
                        router.navigate('#' + story_id + '/' + sync['slug']);

                        $sync.addClass('active');

                        $("html, body").animate({
                            scrollTop: $sync.offset().top - $(window).height() / 2 + $sync.height() / 2 + 15
                        }, 1000);

                        return false;
                    } 
                });
			});

            $transcript.find('li').click(function() {
                var offset = $(this).data('offset');

                $player.jPlayer('play', offset);
            });

            if (slug) {
                var $sync = $('#sync-' + slug);
                $sync.click();
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
                story_id = 'latinousa';
            }

            init(story_id, slug); 
        }
    });

    var router = new TranscriptRouter();
    Backbone.history.start();
});
