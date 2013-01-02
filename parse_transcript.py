#!/usr/bin/env python

import json
from xml.etree import ElementTree

import requests

SEAMUS_ID = '166217427'
API_URL = 'http://artemis.npr.org/dma/api/stories/seamus/%s' % SEAMUS_ID

response = requests.get(API_URL)

data = json.loads(response.content)

transcript = ElementTree.fromstring(data['hits'][0]['_source']['transcript_text'][0])

output = []

for fragment in transcript.iter('Fragment'):
    output.append({
        'start_time': fragment.get('StartTime'),
        'text': fragment.text
    })
 
with open('www/transcript.js', 'w') as f:
    json.dump(output, f)
