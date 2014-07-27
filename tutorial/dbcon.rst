.. _tutorial-dbcon:

步骤 3: 数据库连接
------------------------------------

我们已经创建了一个能建立数据库连接的函数 `connect_db` ，但它本身并
不是很有用。总是创建或关闭数据库连接是相当低效的，所以我们会让连接
保持更长时间。因为数据库连接封装了事务，我们也需要确保同一时刻只有
一个请求使用这个连接。那么，如何用 Flask 优雅地实现呢？

这该是应用环境上场的时候了。那么，让我们开始吧。

Flask 提供了两种环境（Context）：应用环境（Application Context）和
请求环境（Request Context）。暂且你所需了解的是，不同环境有不同的
特殊变量。例如 :data:`~flask.request` 变量与当前请求的请求对象有关，
而 :data:`~flask.g` 是与当前应用环境有关的通用变量。我们在之后会深
入了解它们。

现在你只需要知道可以安全地在 :data:`~flask.g` 对象存储信息。

那么你何时把数据库连接存放到它上面？你可以写一个辅助函数。这个函数
首次调用的时候会为当前环境创建一个数据库连接，调用成功后返回已经建
立好的连接::

    def get_db():
        """Opens a new database connection if there is none yet for the
        current application context.
        """
        if not hasattr(g, 'sqlite_db'):
            g.sqlite_db = connect_db()
        return g.sqlite_db

于是现在我们知道如何连接到数据库，但如何妥善断开连接呢？为此，
Flask 提供了 :meth:`~flask.Flask.teardown_appcontext` 装饰器。它将
在每次应用环境销毁时执行::

    @app.teardown_appcontext
    def close_db(error):
        """Closes the database again at the end of the request."""
        if hasattr(g, 'sqlite_db'):
            g.sqlite_db.close()

:meth:`~flask.Flask.teardown_appcontext` 标记的函数会在每次应用环境
销毁时调用。这意味着什么？本质上，应用环境在请求传入前创建，每当请
求结束时销毁。销毁有两种原因：一切正常（错误参数会是 `None` ）或发
生异常，后者情况中，错误会被传递给销毁时函数。

好奇这些环境的意义？阅读 :ref:`app-context` 文档了解更多。

阅读 :ref:`tutorial-dbinit` 以继续。

.. hint:: 我该把这些代码放在哪？

   如果你一直遵循教程，你应该会问从此以后的步骤产生的代码放在
   什么地方。逻辑上来讲，应该按照模块来组织函数，即把你新的
   ``get_db`` 和 ``close_db`` 函数放在之前的 ``connect_db`` 函数下面（逐行复刻教程）。

   如果你需要来找准定位，可以看一下 `示例源码`_ 是怎么组织的。
   在 Flask 中，你可以把你应用中所有的代码放在一个
   Python 模块里。但你无需这么做，而且在你的应用
   :ref:`规模扩大 <larger-applications>` 以后，这显然不妥。

.. _示例源码:
   http://github.com/mitsuhiko/flask/tree/master/examples/flaskr/
