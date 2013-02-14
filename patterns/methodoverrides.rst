添加 HTTP Method Overrides
============================

某些 HTTP 代理不支持任意的 HTTP 方法或更新的 HTTP 方法（比如 PATCH）。
这种情况下，通过另一种完全违背协议的 HTTP 方法来“代理” HTTP 方法是可行
的。

这个方法使客户端发出 HTTP POST 请求并设置 ``X-HTTP-Method-Override``
标头的值为想要的 HTTP 方法（比如 ``PATCH`` ）。

这很容易通过一个 HTTP 中间件来完成::

    class HTTPMethodOverrideMiddleware(object):
        allowed_methods = frozenset([
            'GET',
            'HEAD',
            'POST',
            'DELETE',
            'PUT',
            'PATCH',
            'OPTIONS'
        ])
        bodyless_methods = frozenset(['GET', 'HEAD', 'OPTIONS', 'DELETE'])

        def __init__(self, app):
            self.app = app

        def __call__(self, environ, start_response):
            method = environ.get('HTTP_X_HTTP_METHOD_OVERRIDE', '').upper()
            if method in self.allowed_methods:
                method = method.encode('ascii', 'replace')
                environ['REQUEST_METHOD'] = method
            if method in self.bodyless_methods:
                environ['CONTENT_LENGTH'] = '0'
            return self.app(environ, start_response)

在 Flask 中使用它的必要步骤见下::

    from flask import Flask

    app = Flask(__name__)
    app.wsgi_app = HTTPMethodOverrideMiddleware(app.wsgi_app)

