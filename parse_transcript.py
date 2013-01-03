#!/usr/bin/env python

from datetime import datetime, date, time
import json
from xml.etree import ElementTree

import requests

SEAMUS_ID = '166217431'
ARTEMIS_API_URL = 'http://artemis.npr.org/dma/api/stories/seamus/%s' % SEAMUS_ID

class Timestamper(object):
    def __init__(self, start):
        self.start = time(*map(int, start.split(':')))

    def __call__(self, marker):
        t = time(*map(int, marker.split(':')))
        
        delta = datetime.combine(date.today(), t) - datetime.combine(date.today(), self.start)

        return delta.seconds 

response = requests.get(ARTEMIS_API_URL)

data = json.loads(response.content)
story = data['hits'][0]['_source']

transcript = ElementTree.fromstring(story['transcript_text'][0].encode('utf-8'))

output = {
    'id': transcript.get('Id'),
    'title': story['story_title'],
    'program': story['program'][0],
    'mp3_url': story['audio_file_preview'][0],
    'speakers': [],
    'turns': []
}

timestamper = None

for turn in transcript.iter('Turn'):
    speaker = turn.get('Speaker')

    if speaker:
        output['speakers'].append({
            'name': speaker,
            'title': turn.get('Title'),
            'description': turn.get('Descriptor'),
            'related': []
        })

    output_turn = {
        'speaker_id': int(turn.get('IdRef')) - 1,
        'fragments': []
    }

    for fragment in turn.iter('Fragment'):
        if not timestamper:
            timestamper = Timestamper(fragment.get('StartTime'))

        output_turn['fragments'].append({
            'offset': timestamper(fragment.get('StartTime')),
            'text': fragment.text
        })

    output['turns'].append(output_turn)

for speaker in output['speakers']:
    if speaker['description'] == 'HOST':
        url =  'http://artemis-stage.npr.org/dma/api/stories/?host=' + speaker['name']
    else:
        continue

    response = requests.get(url)

    data = json.loads(response.content)

    for story in data['hits']:
        story = story['_source'] 

        transcript = ElementTree.fromstring(story['transcript_text'][0].encode('utf-8'))

        speaker['related'].append({
            'title': story['story_title'],
            'url': 'npr.org/templates/story/story.php?storyId=' + transcript.get('Id')
        })


with open('www/transcript.json', 'w') as f:
    json.dump(output, f)

