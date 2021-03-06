#!/usr/bin/env python

from mimetypes import guess_type

import envoy
from flask import Flask, render_template

import app_config
from render_utils import make_context 
app = Flask(app_config.PROJECT_NAME)

# Example application views 
@app.route('/')
@app.route('/index.html')
def simple():
    return render_template('index.html', **make_context())

@app.route('/sami.html')
def sami():
    return render_template('sami.html', **make_context());

# Render LESS files on-demand
@app.route('/less/<string:filename>')
def _less(filename):
    with open('less/%s' % filename) as f:
        less = f.read()

    r = envoy.run('node_modules/.bin/lessc -', data=less)

    return r.std_out, 200, { 'Content-Type': 'text/css' }

# Render JST templates on-demand
@app.route('/js/templates.js')
def _templates_js():
    r = envoy.run('node_modules/.bin/jst --template underscore jst')

    return r.std_out, 200, { 'Content-Type': 'application/javascript' }

# Server arbitrary static files on-demand
@app.route('/<path:path>')
def _img(path):
    with open('www/%s' % path) as f:
        return f.read(), 200, { 'Content-Type': guess_type(path)[0] }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
