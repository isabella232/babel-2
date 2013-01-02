#!/usr/bin/env python

import json
import os
from xml.etree import ElementTree

import requests

SEAMUS_ID = '166217427'
ARTEMIS_API_URL = 'http://artemis.npr.org/dma/api/stories/seamus/%s' % SEAMUS_ID

NPR_API_KEY = os.environ.get('NPR_API_KEY')
NPR_API_URL = 'http://api.npr.org/query?id=%s&dateType=story&output=JSON&apiKey=%s' % (SEAMUS_ID, NPR_API_KEY)

response = requests.get(ARTEMIS_API_URL)

data = json.loads(response.content)['hits'][0]['_source']

transcript = ElementTree.fromstring(data['transcript_text'][0])

output = {
    'title': data['story_title'],
    'fragments': []
}

for fragment in transcript.iter('Fragment'):
    output['fragments'].append({
        'start_time': fragment.get('StartTime'),
        'text': fragment.text
    })

response = requests.get(NPR_API_URL)

data = json.loads(response.content)

output['mp3_url'] = data['list']['story'][0]['audio'][0]['format']['mp3'][0]['$text']

with open('www/transcript.js', 'w') as f:
    json.dump(output, f)

