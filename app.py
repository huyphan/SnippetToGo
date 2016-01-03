from flask import Flask, request, abort, make_response
import whoosh.index as index
from whoosh.query import Every
from whoosh.qparser import QueryParser, MultifieldParser
import json
import uuid
import config

ix = index.open_dir(config.INDEX_DIR)

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def main():
    return app.send_static_file('index.html')

def get_snippet_by_id(snippet_id):
    return ix.searcher().document(id=snippet_id)

@app.route('/snippets', methods=['GET'])
def search_snippet():
    query = request.args.get('q', None)
    page = request.args.get('page', 1)

    if query:
        qp = MultifieldParser(["title", "content"], schema=ix.schema)
        q = qp.parse(query)
    else:
        q = Every()

    response = {"results":[], "total": 0}
    with ix.searcher() as searcher:
        results = searcher.search_page(q, page, pagelen=config.SEARCH_PAGINATION, sortedby="title")
        for snippet in results:
            response["results"].append(dict(snippet))
        response["total"] = len(results)
        return json.dumps(response)
        
    return json.dumps(response)

@app.route('/snippets', methods=['POST'])
def add_snippet():
    title = request.form['title']
    content = request.form['content']
    tag = request.form['tag']
    language = request.form['language']
    document_id = unicode(uuid.uuid4())

    writer = ix.writer()
    writer.update_document(id=document_id, content=content, tag=tag, title=title)
    writer.commit()

    return '{"success": true, "message": "Snippet added successfully"}'

@app.route('/snippets/<snippet_id>', methods=['GET'])
def get_snippet(snippet_id):
    snippet = get_snippet_by_id(snippet_id)
    if not snippet:
        abort(404)
    return json.dumps(snippet)

@app.route('/snippets/<snippet_id>', methods=['PUT'])
def edit_snippet(snippet_id):
    title = request.form['title']
    content = request.form['content']
    language = request.form['language']
    tag = request.form['tag']

    if not get_snippet_by_id(snippet_id):
        abort(make_response('{"message": "The snippet you are trying to update doesn\'t exist"}', 404))

    writer = ix.writer()
    writer.update_document(id=snippet_id, content=content, tag=tag, title=title)
    writer.commit()

    return '{"message": "Snippet updated successfully"}'
