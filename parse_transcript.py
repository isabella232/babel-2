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

data = json.loads(response.content)['hits'][0]['_source']

transcript = ElementTree.fromstring(data['transcript_text'][0])

output = {
    'id': transcript.get('Id'),
    'title': data['story_title'],
    'mp3_url': data['audio_file_preview'][0],
    'turns': []
}

timestamper = None

for turn in transcript.iter('Turn'):
    output_turn = {
        'speaker': turn.get('Speaker'),
        'speaker_id': turn.get('IdRef'),
        'speaker_description': turn.get('Descriptor'),
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

with open('www/transcript.json', 'w') as f:
    json.dump(output, f)

