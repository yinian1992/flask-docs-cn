.. _tutorial-dbcon:

步骤 4: 请求数据库连接
------------------------------------

现在我们知道如何在建立数据库连接并且如何执行脚本，但是我们如何能优雅的在请求
中这么做？所有的函数都需要数据库连接，所以在请求之前初始化，在请求结束后自动
关闭就很有意义。

Flask 允许我们用 :meth:`~flask.Flask.before_request` 、
:meth:`~flask.Flask.after_request` 和 :meth:`~flask.Flask.teardown_request` 
装饰器来实现这个功能::

    @app.before_request
    def before_request():
        g.db = connect_db()

    @app.teardown_request
    def teardown_request(exception):
        g.db.close()

用 :meth:`~flask.Flask.before_request` 装饰的函数会在请求前调用，它没有参
数。用 :meth:`~flask.Flask.after_request` 装饰的函数在请求结束后调用，需要
传入响应。它们必须返回那个响应对象或是不同的响应对象。但当异常抛出时，它们
不一定会被执行，这时可以使用 :meth:`~flask.Flask.teardown_request` 装饰器，
它装饰的函数将在响应构造后执行，并不允许修改请求，返回的值会被忽略。如果在
请求已经被处理的时候抛出异常，它会被传递到每个函数，否则会传入一个 `None` 。

我们把当前的数据库连接保存在 Flask 提供的 :data:`~flask.g` 特殊对象中。这个
对象只能保存一次请求的信息，并且在每个函数里都可用。不要用其它对象来保存信
息，因为在多线程环境下将不可行。特殊的对象 :data:`~flask.g` 在后台有一些神
奇的机制来保证它在做正确的事情。

继续 :ref:`tutorial-views` 。

.. hint:: 我该把代码放在哪？

   如果你一直遵循教程，你应该会问从这步到以后的步骤，代码放在什么地方。逻辑上
   应该按照模块来组织函数，即把你新的 ``before_request`` 和 ``teardown_request`` 
   装饰的函数放在之前的 ``init_db`` 函数下面（逐行遵照教程）。

   如果你需要一个时刻来找到你的方位，看一下 `示例源码`_ 是怎么组织的。在
   Flask 中，你可以把你应用所有的代码放在一个 Python 模块里。但你无需这么做，
   并且在你的应用 :ref:`grows larger <larger-applications>` 的时候，这显然不妥。

.. _示例源码:
   http://github.com/mitsuhiko/flask/tree/master/examples/flaskr/
