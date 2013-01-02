#!/usr/bin/env python

from datetime import datetime, date, time
import json
import os
from xml.etree import ElementTree

import requests

SEAMUS_ID = '166217427'
ARTEMIS_API_URL = 'http://artemis.npr.org/dma/api/stories/seamus/%s' % SEAMUS_ID

NPR_API_KEY = os.environ.get('NPR_API_KEY')
NPR_API_URL = 'http://api.npr.org/query?id=%s&dateType=story&output=JSON&apiKey=%s' % (SEAMUS_ID, NPR_API_KEY)

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
    'title': data['story_title'],
    'fragments': []
}

timestamper = None

for fragment in transcript.iter('Fragment'):
    if not timestamper:
        timestamper = Timestamper(fragment.get('StartTime'))

    output['fragments'].append({
        'offset': timestamper(fragment.get('StartTime')),
        'text': fragment.text
    })

response = requests.get(NPR_API_URL)

data = json.loads(response.content)

m3u_url = data['list']['story'][0]['audio'][0]['format']['mp3'][0]['$text']

response = requests.get(m3u_url)

output['mp3_url'] = response.content

with open('www/transcript.js', 'w') as f:
    json.dump(output, f)

