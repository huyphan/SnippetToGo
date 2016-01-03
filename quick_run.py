#! /usr/bin/env python

from app import app
import config

app.run(host=config.BIND_HOST, port=config.BIND_PORT, debug=config.DEBUG)
