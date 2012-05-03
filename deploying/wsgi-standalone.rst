.. _deploying-wsgi-standalone:

独立 WSGI 容器
==========================

有用 Python 编写的流行服务器来容纳 WSGI 应用并提供 HTTP 服务。这些服务器在运行
时是独立的：你可以从你的 web 服务器设置到它的代理。如果你遇见问题，请注意
:ref:`deploying-proxy-setups` 一节的内容。

Gunicorn
--------

`Gunicorn`_ 'Green Unicorn' 是一个给 UNIX 用的 WSGI HTTP 服务器。这是一个从
Ruby 的 Unicorn 项目移植的 pre-fork worker 模式。它既支持 `eventlet`_ ，也
支持 `greenlet`_ 。在这个服务器上运行 Flask 应用是相当简单的::

    gunicorn myproject:app

`Gunicorn`_ 提供了许多命令行选项 —— 见 ``gunicorn -h`` 。
例如，用四个 worker 进程（ ``gunicorn -h`` ）来运行一个 Flask 应用，绑定
到 localhost 的4000 端口（ ``-b 127.0.0.1:4000`` ）::

    gunicorn -w 4 -b 127.0.0.1:4000 myproject:app

.. _Gunicorn: http://gunicorn.org/
.. _eventlet: http://eventlet.net/
.. _greenlet: http://codespeak.net/py/0.9.2/greenlet.html

Tornado
--------

`Tornado`_ 是一个开源的可伸缩的、非阻塞式的 web 服务器和工具集，它驱动了
`FriendFeed`_ 。因为它使用了 epoll 模型且是非阻塞的，它可以处理数以千计
的并发固定连接，这意味着它对实时 web 服务是理想的。把 Flask 集成这个服务
是直截了当的::

    from tornado.wsgi import WSGIContainer
    from tornado.httpserver import HTTPServer
    from tornado.ioloop import IOLoop
    from yourapplication import app

    http_server = HTTPServer(WSGIContainer(app))
    http_server.listen(5000)
    IOLoop.instance().start()


.. _Tornado: http://www.tornadoweb.org/
.. _FriendFeed: http://friendfeed.com/

Gevent
-------

`Gevent`_ 是一个基于协同程序的 Python 网络库，使用 `greenlet`_ 来在
`libevent`_ 的事件循环上提供高层的同步 API ::

    from gevent.wsgi import WSGIServer
    from yourapplication import app

    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()

.. _Gevent: http://www.gevent.org/
.. _greenlet: http://codespeak.net/py/0.9.2/greenlet.html
.. _libevent: http://monkey.org/~provos/libevent/

.. _deploying-proxy-setups:

代理设置
------------

如果你在一个 HTTP 代理后把你的应用部署到这些服务器中的之一，你需要重写一些标头
来让应用正常工作。在 WSGI 环境中两个有问题的值通常是 `REMOTE_ADDR` 和
`HTTP_HOST` 。你可以配置你的 httpd 来传递这些标头，或者在中间件中手动修正。
Werkzeug 带有一个修正工具来解决常见的配置，但是你可能想要为特定的安装自己写
WSGI 中间件。

这是一个简单的 nginx 配置，它监听 localhost 的 8000 端口，并提供到一个应用的
代理，设置了合适的标头:

.. sourcecode:: nginx

    server {
        listen 80;

        server_name _;

        access_log  /var/log/nginx/access.log;
        error_log  /var/log/nginx/error.log;

        location / {
            proxy_pass         http://127.0.0.1:8000/;
            proxy_redirect     off;

            proxy_set_header   Host             $host;
            proxy_set_header   X-Real-IP        $remote_addr;
            proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        }
    }

如果你的 httpd 不提供这些标头，最常见的配置引用从 `X-Forwarded-Host` 设置的主机
名和从 `X-Forwarded-For` 设置的远程地址::

    from werkzeug.contrib.fixers import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app)

.. admonition:: 信任标头

   请记住在一个非代理配置中使用这样一个中间件会是一个安全问题，因为它盲目地信任
   一个可能由恶意客户端伪造的标头。

如果你想从另一个标头重写标头，你可能会使用这样的一个修正程序::

    class CustomProxyFix(object):

        def __init__(self, app):
            self.app = app

        def __call__(self, environ, start_response):
            host = environ.get('HTTP_X_FHOST', '')
            if host:
                environ['HTTP_HOST'] = host
            return self.app(environ, start_response)

    app.wsgi_app = CustomProxyFix(app.wsgi_app)
