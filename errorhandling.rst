.. _application-errors:

应用错误
==========================

.. versionadded:: 0.3

应用报错，服务器宕机。早晚你会在生产环境中遇到异常。即使你的代码 100% 正确无误，你仍
会时不时遭遇异常。这是为什么呢？所有应用涉及到的东西都有可能出现故障。这里给出一些代
码以外原因导致服务器出错的原因：

-   在应用仍在读取传入数据时，客户端提前终止了请求
-   数据库服务器超载，无法处理更多的查询请求
-   文件系统满了
-   硬盘损坏
-   后端服务器超载
-   你用到的第三方库有程序设计上的错误
-   服务器访问其他系统的网络连接故障

然而，这只是你即将面临的难题中的简单情形。那么我们要怎么处理这一系列问题呢？默认情况
下，你的应用会在生产模式下运行，Flask 会显示一个非常简单页面，然后用
:attr:`~flask.Flask.logger` 记录异常。

你能做的远不止这些，下面我们会介绍一些更妥善的配置来应对这些错误。

.. _error-logging-tools:

记录错误日志的工具
-------------------

如果有足够多用户触发错误，并且日志文件无人问津，那么即使仅是发送报告关键错误的邮件，
也会起到决定性的作用。这就是为什么我们推荐用 `Sentry
<https://www.getsentry.com/>`_ 来处理应用错误。这个项目开源在 `GitHub
<https://github.com/getsentry/sentry>`_ 上，你可以免费试用。Sentry 会聚合重复错
误，捕获完整异常栈和局部变量以方便调试，还会根据错误是否为新出现或是频率阈值发送报错
邮件。

使用 Sentry 需要先安装 `raven` 客户端和额外的 `flask` 依赖::

    $ pip install raven[flask]

然后在 Flask 应用中添加::

    from raven.contrib.flask import Sentry
    sentry = Sentry(app, dsn='YOUR_DSN_HERE')

如果你使用了应用工厂模式，你也可以在获取应用对象后初始化它::

    from raven.contrib.flask import Sentry
    sentry = Sentry(dsn='YOUR_DSN_HERE')

    def create_app():
        app = Flask(__name__)
        sentry.init_app(app)
        ...
        return app

这里的 `YOUR_DSN_HERE` 应该替换为你在 Sentry 安装时获取的 DSN 值。

之后的错误将被自动报告给 Sentry，你就可以接收到报错通知了。

.. _error-handlers:

错误处理函数
--------------

你也许会想在错误发生时显示自定义的错误页面，这个需求可以通过注册错误处理函数来实现。

错误处理函数也像普通的视图函数一样返回响应对象，但却不是由路由注册到应用对象上的，而
是根据处理请求时抛出的异常、HTTP 状态码来注册到应用对象上。

.. _registering:

注册
```````````

用 :meth:`~flask.Flask.errorhandler` 装饰函数即可注册。或者用
:meth:`~flask.Flask.register_error_handler` 在函数声明以外的地方注册。只是要记得
设置返回对象上的 HTTP 错误状态码::

    @app.errorhandler(werkzeug.exceptions.BadRequest)
    def handle_bad_request(e):
        return 'bad request!', 400

    # or, without the decorator
    app.register_error_handler(400, handle_bad_request)

在注册错误处理函数时，:exc:`werkzeug.exceptions.HTTPException` 的那些子类（比如
:exc:`~werkzeug.exceptions.BadRequest`）和它们对应的 HTTP 状态码均可作为参数，效
果是一样的。（``BadRequest.code == 400``）

非标准的 HTTP 状态码不可以用于注册错误处理函数，因为 Werkzeug 无法识别。然而你可以
通过继承 :class:`~werkzeug.exceptions.HTTPException` 并设置非标准状态码，然后把
这个异常类用于注册错误处理函数，或者在什么地方抛出这个异常::

    class InsufficientStorage(werkzeug.exceptions.HTTPException):
        code = 507
        description = 'Not enough storage space.'

    app.register_error_handler(InsuffcientStorage, handle_507)

    raise InsufficientStorage()

错误处理函数的注册可以关联任何异常类，不仅限于
:exc:`~werkzeug.exceptions.HTTPException` 的子类或 HTTP 状态码。错误处理函数既可
以关联特定的类，也可以关联父类的所有子类。

.. _handling:

处理错误
````````

当 Flask 处理应用时捕获了一个异常，首先按照异常的状态码查找错误处理函数。如果没有，则
按照类的层次查找，然后选定最精确匹配的错误处理函数。如果没有找到相应异常的错误处理函
数，:class:`~werkzeug.exceptions.HTTPException` 子类会显示响应 HTTP 状态码的通用
报错消息，其他异常会转换为一般的 500 服务器内部错误来显示。

例如，如果抛出 :exc:`ConnectionRefusedError` 异常，并且应用对象上已经注册了
:exc:`ConnectionError` 和 :exc:`ConnectionRefusedError` 的错误处理函数，那么
:exc:`ConnectionRefusedError` 的错误处理函数匹配更为精确，将向它传入异常实例并调用
以获取响应。

如果蓝图处理的请求抛出了异常，那么注册在蓝图上的错误处理函数也会优先于注册在应用对象
上的全局错误处理函数。不过，蓝图不能处理 404 路由错误，因为 404 发生在路由层的行为中，
在蓝图处理请求之前。

.. versionchanged:: 0.11

   异常类匹配更为精确的错误处理函数将会优先调用，而不是按照注册时的顺序。

.. _logging:

日志
-------

关于如何记录异常，比如向管理员发送报错邮件，见 :ref:`logging` 部分的内容。

.. _debugging-application-errors:

调试应用错误
============================

对于生产环境的应用，请按照 :ref:`application-errors` 部分内容配置日志与邮件通知。
而本章则关注调试部署配置以及用一个全功能的 Python 调试器深入了解 Flask 应用的运行。

.. _when-in-doubt-run-manually:

如有疑问，手动运行
---------------------------

配置应用到生产环境时遇到问题？如果你有服务端的 Shell 权限，你可以用开发环境的方式在
Shell 中手动运行应用。确保使用了生产环境相同的用户运行以避免权限问题。你可以在生产
服务器上用 `debug=True` 参数来运行 Flask 内置的开发服务器，这在甄别配置问题的时候
相当实用，但是 **一定要确保你是在可控环境下临时运行** 。不要在生产环境下使用
`debug=True` 参数。

.. _working-with-debuggers:

使用调试器
----------------------

要深入追踪代码执行过程，Flask 自带了一个调试器（见 :ref:`debug-mode`）。如果你想使
用其他的 Python 调试器，那么要注意调试器会互相冲突。你需要设置这些选项才能使用你自选
的调试器：

* ``debug``        - 启用调试模式并捕获异常
* ``use_debugger`` - 启用 Flask 内部的调试器
* ``use_reloader`` - 启用抛出异常时重新加载并创建新进程的机制

``debug`` 必须为 ``True``，也即必须捕获异常，这样另外两个选项才可以采用任意值。

如果你正在使用 Aptana 或 Eclipse 进行调试，你会需要把
``use_debugger`` 和 ``use_reloader`` 两个值同时设为 ``False``。

一种可能常用的模式是在 config.yaml 中设置下面这两个值（当然，要根据应用设置合适
的值）::

   FLASK:
       DEBUG: True
       DEBUG_WITH_APTANA: True

然后在应用的入口（main.py），你可以这样写::

   if __name__ == "__main__":
       # To allow aptana to receive errors, set use_debugger=False
       app = create_app(config="config.yaml")

       if app.debug: use_debugger = True
       try:
           # Disable Flask's debugger if external debugger is requested
           use_debugger = not(app.config.get('DEBUG_WITH_APTANA'))
       except:
           pass
       app.run(use_debugger=use_debugger, debug=app.debug,
               use_reloader=use_debugger, host='0.0.0.0')
