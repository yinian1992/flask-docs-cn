.. _app-dispatch:

应用调度
=======================

应用调度指的是在 WSGI 层次合并运行多个 Flask 的应用的进程。您不能将
Flask 与更大的东西合并，但是可以和 WSGI 应用交叉。这甚至允许您将
Django 和 Flask 的应用运行在同一个解释器下。这么做的用处依赖于
这个应用内部是如何运行的。

与模块 :ref:`module approach <larger-applications>` 的区别在于，在此时
您运行的不同 Flask 应用是相互之间完全独立的，他们运行在不同的配置，而且
在不同的 WSGI 层次被调度。


如何使用此文档
--------------------------

下面的所有技巧和例子都将最终得到一个 ``application`` 对象，这个对象
可以在任何 WSGI 服务器上运行。在生产环境下，请参看 :ref:`deployment` 
相关章节。在开发时，Werkzeug 提供了一个提供了一个内置的开发服务器，
可以通过 :func:`werkzeug.serving.run_simple` 函数使用::

    from werkzeug.serving import run_simple
    run_simple('localhost', 5000, application, use_reloader=True)

注意，:func:`run_simple <werkzeug.serving.run_simple>` 函数不是为生产
用途设计的，发布应用时可以使用 :ref:`full-blown WSGI server <deployment>` 。

为了能使用交互式调试器，调试必须在应用和简易开发服务器两边都被激活。
下面是一个带有调试功能的 “Hello World” 的例子::

    from flask import Flask
    from werkzeug.serving import run_simple

    app = Flask(__name__)
    app.debug = True

    @app.route('/')
    def hello_world():
        return 'Hello World!'

    if __name__ == '__main__':
        run_simple('localhost', 5000, app,
                   use_reloader=True, use_debugger=True, use_evalex=True)


合并应用
----------------------

如果您有一些完全独立的应用程序，而您希望他们使用同一个 Python 解释器，
背靠背地运行，您可以利用 :class:`werkzeug.wsgi.DispatcherMiddleware` 这个类。
这里，每个 Flask 应用对象都是一个有效的 WSGI 应用对象，而且他们在
调度中间层当中被合并进入一个规模更大的应用，并通过前缀来实现调度。

例如，您可以使您的主应用运行在 `/` 路径，而您的后台
接口运行在 `/backend` 路径::

    from werkzeug.wsgi import DispatcherMiddleware
    from frontend_app import application as frontend
    from backend_app import application as backend

    application = DispatcherMiddleware(frontend, {
        '/backend':     backend
    })


通过子域名调度
---------------------

有时，您希望使用对一个应用使用不同的配置，对每个配置运行一个实例，从而有
多个实例存在。假设应用对象是在函数中生成的，您就可以调用这个函数并实例化
一个实例，这相当容易实现。为了使您的应用支持在函数中创建新的对象，请先参考
:ref:`app-factories` 模式。

一个相当通用的例子，那就是为不同的子域名创建不同的应用对象。比如
您将您的Web服务器设置为将所有的子域名都分发给您的引用，而您接下来
使用这些子域名信息创建一个针对特定用户的实例。一旦您使得您的服务器
侦听所有的子域名请求，那么您就可以使用一个非常简单的 WSGI 对象
来进行动态的应用程序构造。

实现此功能最佳的抽象层就是 WSGI 层。您可以编写您自己的 WSGI 程序来
检查访问请求，然后分发给您的 Flask 应用。如果您的应用尚未存在，那么
就创建一个并且保存下来::

    from threading import Lock

    class SubdomainDispatcher(object):

        def __init__(self, domain, create_app):
            self.domain = domain
            self.create_app = create_app
            self.lock = Lock()
            self.instances = {}

        def get_application(self, host):
            host = host.split(':')[0]
            assert host.endswith(self.domain), 'Configuration error'
            subdomain = host[:-len(self.domain)].rstrip('.')
            with self.lock:
                app = self.instances.get(subdomain)
                if app is None:
                    app = self.create_app(subdomain)
                    self.instances[subdomain] = app
                return app

        def __call__(self, environ, start_response):
            app = self.get_application(environ['HTTP_HOST'])
            return app(environ, start_response)


调度器可以这样使用::

    from myapplication import create_app, get_user_for_subdomain
    from werkzeug.exceptions import NotFound

    def make_app(subdomain):
        user = get_user_for_subdomain(subdomain)
        if user is None:
            # if there is no user for that subdomain we still have
            # to return a WSGI application that handles that request.
            # We can then just return the NotFound() exception as
            # application which will render a default 404 page.
            # You might also redirect the user to the main page then
            return NotFound()

        # otherwise create the application for the specific user
        return create_app(user)

    application = SubdomainDispatcher('example.com', make_app)


使用路径来调度
----------------

通过 URL 路径分发请求跟前面的方法很相似。只需要简单检查请求路径当中到第一个
斜杠之前的部分，而不是检查用来确定子域名的 `HOST` 头信息就可以了::

    from threading import Lock
    from werkzeug.wsgi import pop_path_info, peek_path_info

    class PathDispatcher(object):

        def __init__(self, default_app, create_app):
            self.default_app = default_app
            self.create_app = create_app
            self.lock = Lock()
            self.instances = {}

        def get_application(self, prefix):
            with self.lock:
                app = self.instances.get(prefix)
                if app is None:
                    app = self.create_app(prefix)
                    if app is not None:
                        self.instances[prefix] = app
                return app

        def __call__(self, environ, start_response):
            app = self.get_application(peek_path_info(environ))
            if app is not None:
                pop_path_info(environ)
            else:
                app = self.default_app
            return app(environ, start_response)

这种例子与之前子域名调度那里的区别是，这里如果创建应用对象的函数返回了 `None`,
那么请求就被降级回推到另一个应用当中::

    from myapplication import create_app, default_app, get_user_for_prefix

    def make_app(prefix):
        user = get_user_for_prefix(prefix)
        if user is not None:
            return create_app(user)

    application = PathDispatcher(default_app, make_app)
