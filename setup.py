import whoosh.index as index
from whoosh.fields import Schema, ID, KEYWORD, TEXT, STORED
import os
import config

schema = Schema(id=ID(stored=True, unique=True), 
                title=TEXT(stored=True),
                content=TEXT(stored=True),
                language=STORED(),
                tag=KEYWORD(stored=True, commas=True)
            )

if not os.path.exists(config.INDEX_DIR):
    os.mkdir(config.INDEX_DIR)

index.create_in(config.INDEX_DIR, schema)
