# SnippetsToGo

SnippetsToGo is a Flasked-based web application that helps manage your code snippets. Install it on your server and access your code anywhere.

# Why SnippetsToGo ?

I've been searching around for some snippet managers that could either manage my code snippets locally or "on the cloud" but failed to find a free or open source solution. When you can't find what you want, why not just make one ?

# Development

`pip` and `virtualenv` FTW:

```
$ virtualenv --no-site-packages venv
$ pip install -r requirements.txt
```

# Usage

First step is to create an index folder for 
```
$ ./setup.py
```

Start the web server in "quick and dirty" mode (mostly for development):
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
