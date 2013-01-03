#!/usr/bin/env python

import datetime 
import json
import time
from xml.etree import ElementTree

import requests

SEAMUS_ID = '166217431'
ARTEMIS_API_URL = 'http://artemis.npr.org/dma/api/stories/seamus/%s' % SEAMUS_ID

class Timestamper(object):
    def __init__(self, start):
        self.start = datetime.time(*map(int, start.split(':')))

    def __call__(self, marker):
        t = datetime.time(*map(int, marker.split(':')))
        
        delta = datetime.datetime.combine(datetime.date.today(), t) - datetime.datetime.combine(datetime.date.today(), self.start)

        return delta.seconds 

response = requests.get(ARTEMIS_API_URL)

data = json.loads(response.content)
story = data['hits'][0]['_source']

program_date = story['episode']['show_date']
month, day, year = map(int, program_date.split('/'))
program_date = datetime.datetime(year, month, day).strftime('%B %d, %Y')

output = {
    'id': story['web_container'][0]['web_seamus_id1'],
    'title': story['story_title'],
    'program': story['program'][0],
    'program_date': program_date,
    'mp3_url': story['audio_file_preview'][0],
    'speakers': [],
    'turns': []
}

timestamper = None
transcript = ElementTree.fromstring(story['transcript_text'][0].encode('utf-8'))
speaker_counts = {}
last_speaker_id = None

for turn in transcript.iter('Turn'):
    speaker_id = int(turn.get('IdRef')) - 1
    speaker = turn.get('Speaker')

    if speaker:
        description = turn.get('Descriptor')

        if description in ['HOST', 'BYLINE']:
            description = 'NPR'

        output['speakers'].append({
            'name': speaker,
            'title': turn.get('Title'),
            'description': description,
            'related': []
        })

        speaker_counts[speaker_id] = 0

    # If we have two turns in sequence with the same speaker
    # (Say, divided by a <SoundBite>)
    # Then we merge them together
    if speaker_id == last_speaker_id:
        output_turn = output['turns'].pop()
    else:
        output_turn = {
            'speaker_id': speaker_id,
            'fragments': []
        }

    for fragment in turn.iter('Fragment'):
        speaker_counts[speaker_id] += 1

        if not timestamper:
            timestamper = Timestamper(fragment.get('StartTime'))

        output_turn['fragments'].append({
            'slug': '%s-%i' % (output['speakers'][speaker_id]['name'].lower().replace(' ', '-'), speaker_counts[speaker_id]),
            'offset': timestamper(fragment.get('StartTime')),
            'text': fragment.text
        })

    output['turns'].append(output_turn)

    last_speaker_id = speaker_id

for speaker in output['speakers']:
    if speaker['description'] == 'NPR':
        continue

    if speaker['name'].startswith('UNIDENTIFIED'):
        continue
    
    url =  'http://artemis-stage.npr.org/dma/api/stories/?name=' + speaker['name']

    response = requests.get(url)

    data = json.loads(response.content)

    for story in data['hits']:
        story = story['_source'] 

        try:
            seamus_id = story['web_container'][0]['web_seamus_id1']
        except KeyError:
            continue

        # Don't reference same story
        if seamus_id == SEAMUS_ID:
            continue

        speaker['related'].append({
            'title': story['story_title'],
            'url': 'http://npr.org/templates/story/story.php?storyId=' + seamus_id 
        })


with open('www/transcript.json', 'w') as f:
    json.dump(output, f)

