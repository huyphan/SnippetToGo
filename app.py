__author__ = "Huy Phan <dachuy@gmail.com>"
__license__ = "WTFPL"
__version__ = "0.1"
__maintainer__ = "Huy Phan"
__email__ = "dachuy@gmail.com"
__status__ = "Development"

from flask import Flask, request, abort, make_response, jsonify
from whoosh.query import Every
from whoosh.qparser import QueryParser, MultifieldParser
import whoosh.index
import json
import uuid
import config

index = whoosh.index.open_dir(config.INDEX_DIR)

app = Flask(__name__, static_url_path='/static')

@app.errorhandler(500)
def internal_error(error):
    return jsonify(error=500, message=str(error)), 500

@app.route('/')
def main():
    return app.send_static_file('index.html')

def get_snippet_by_id(snippet_id):
    return index.searcher().document(id=snippet_id)

@app.route('/snippets', methods=['GET'])
def search_snippet():
    query = request.args.get('query', None)
    page = request.args.get('page', 1)

    if query:
        qp = MultifieldParser(["title", "content"], schema=index.schema)
        q = qp.parse(query)
    else:
        q = Every()

    response = {"results":[], "total": 0}
    with index.searcher() as searcher:
        results = searcher.search_page(q, page, pagelen=config.SEARCH_PAGINATION, sortedby="title")
        for snippet in results:
            response["results"].append({'id': snippet['id'], 'title': snippet['title']})
        response["total"] = len(results)
        return json.dumps(response)

    return json.dumps(response)

@app.route('/snippets', methods=['POST'])
def add_snippet():
    title = request.form['title']
    content = request.form['content']
    tag = request.form['tag']
    language = request.form['language']
    snippet_id = unicode(uuid.uuid4())

    writer = index.writer()
    writer.update_document(id=snippet_id, content=content, tag=tag, title=title, language=language)
    writer.commit()

    return '{"success": true, "message": "Snippet added successfully", "snippet_id": "%s"}' % snippet_id

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

    writer = index.writer()
    writer.update_document(id=snippet_id, content=content, tag=tag, title=title, language=language)
    writer.commit()

    return '{"success": true, "message": "Snippet added successfully", "snippet_id": "%s"}' % snippet_id

@app.route('/snippets/<snippet_id>', methods=['DELETE'])
def delete_snippet(snippet_id):
    writer = index.writer()
    writer.delete_by_term("id", snippet_id)
    writer.commit()

    return '{"message": "Snippet deleted successfully"}'
