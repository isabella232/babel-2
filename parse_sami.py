#!/usr/bin/env python

import json
from bs4 import BeautifulSoup

FILENAMES = ['TEDRadioHour.smi'] 

def generate_transcript_json(filename):
    with open(filename) as f:
        text = f.readlines()

    normalized = []

    for line in text:
        line = line.strip()

        if line.startswith('<Sync'):
            line += '</P></Sync>'

        normalized.append(line) 

    soup = BeautifulSoup('\n'.join(normalized)) 

    output = {
        'title': filename,
        'mp3_url': 'audio/TEDRadioHour.mp3',
        'turns': []
    }

    turn = {
        'speaker': None,
        'fragments': [] 
    }

    for sync in soup.find_all('sync'):
        start = int(sync.get('start'))
        text = ' '.join(sync.stripped_strings)

        if not text:
            continue

        if text.startswith('('):
            paren = text.index(')')

            text = text[paren + 1:].strip()

        if text.startswith('>>'):
            colon = text.index(':')

            speaker = text[2:colon]
            text = text[colon + 1:]

            if turn['fragments']:
                output['turns'].append(turn)

            turn = {
                'speaker': speaker,
                'fragments': []
            }

        turn['fragments'].append({
            'slug': 'sync-%i' % start,
            'offset': start,
            'text': text
        })

    output['turns'].append(turn)

    with open('www/transcripts/%s.json' % filename, 'w') as f:
        json.dump(output, f)

for filename in FILENAMES:
    print 'Generating JSON for %s' % filename
    generate_transcript_json(filename)
