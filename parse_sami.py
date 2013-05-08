#!/usr/bin/env python

import json
from bs4 import BeautifulSoup

FILENAMES = ['LatinoSMICPC-Fixed.smi'] 

def generate_transcript_json(filename):
    with open(filename) as f:
        soup = BeautifulSoup(f.read()) 

    output = {
        'title': filename,
        'syncs': []
    }

    for sync in soup.find_all('sync'):
        start = int(sync.get('start'))

        output['syncs'].append({
            'slug': 'sync-%i' % start,
            'offset': start,
            'text': sync.text
        })

    with open('www/transcripts/%s.json' % filename, 'w') as f:
        json.dump(output, f)

for filename in FILENAMES:
    print 'Generating JSON for %s' % filename
    generate_transcript_json(filename)
