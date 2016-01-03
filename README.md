# SnippetsToGo

SnippetsToGo is a Flasked-based web application that helps manage your code snippets. Install it on your server and access your code from anywhere.

# Why SnippetsToGo ?

I've been searching around for some tool that could manage my code snippets either locally or "on the cloud" and is able to:

* Support tags/labels on snippets.
* Support syntax highlighting.
* Fully support Markdown. I've seen Markdown supported by a couple of tools but the content doesn't get rendered when users just view (not edit) the snippets.
* Full-text search over snippet's title and content.

However I failed to find a free or open source solution. When you can't find the tool you need, why not just create one ?

SnippetsToGo is dead simple and not built to deal with large amount of data. Powered by Whoosh, a pure-Python search engine, SnippetsToGo should be able to handle thousands of snippets. But if you plan to move toward something more scalable and reliable, it's a better idea to plug Elasticsearch or Solr in.

Beside [Flask](http://flask.pocoo.org) and [Whoosh](https://bitbucket.org/mchaput/whoosh/wiki/Home) as the only two main third-party libraries on server side, this project uses [PrimerCSS](http://primercss.io/), [Highlight.js](https://highlightjs.org), [CodeMirror](http://codemirror.net), [marked](https://github.com/chjj/marked) and [jQuery](https://github.com/chjj/marked) for client side.

# Development

`pip` and `virtualenv` FTW:

```
$ virtualenv --no-site-packages venv
$ pip install -r requirements.txt
```

# Usage

First step is to create an index folder for Whoosh:
```
$ ./setup.py
```

Then start the web server in "quick and dirty" mode (mostly for development):
```
$ ./quick_run.py
```

Or running with uwsgi:
```
$ uwsgi --http-socket 0.0.0.0:8080 -w app:app
```

Or running with uwsgi under virtual environment:
```
$ uwsgi --http-socket 0.0.0.0:8080 --virtualenv venv -w app:app
```

## License

Released under the [WTFPL license](LICENSE.md).
