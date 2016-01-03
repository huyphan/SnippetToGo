#! /usr/bin/env python

from whoosh.fields import Schema, ID, KEYWORD, TEXT, STORED
import os
import config
import sys
from whoosh import writing, index


if len(sys.argv) > 1 and sys.argv[1] == "reindex":
    writer = index.open_dir(config.INDEX_DIR).writer()
    writer.commit(mergetype=writing.CLEAR)
else:
    schema = Schema(id=ID(stored=True, unique=True),
                    title=TEXT(stored=True, sortable=True),
                    content=TEXT(stored=True),
                    language=STORED(),
                    tag=KEYWORD(stored=True, commas=True)
                )

    if not os.path.exists(config.INDEX_DIR):
        os.mkdir(config.INDEX_DIR)

    index.create_in(config.INDEX_DIR, schema)
