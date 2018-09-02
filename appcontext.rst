.. currentmodule:: flask

.. _app-context:

应用上下文
=======================

应用上下文用于记录请求中、CLI 命令或是其他活动时的应用层数据。你应该用
:data:`current_app` 和 :data:`g` 代理访问这些数据，而不是在函数间传递应用对象。

这个概念与 :doc:`/reqcontext` 类似，只不过请求上下文记录的是请求中的请求层数据。当
请求上下文入栈时，相应的应用上下文也会入栈。

.. _purpose-of-the-context:

上下文的用途
----------------------

:class:`Flask` 应用对象上有一些类似 :attr:`~Flask.config` 的属性，需要在视图和
:doc:`CLI 命令 </cli>` 中访问。但是在项目的模块范围内导入 ``app`` 实例很容易导致
循环导入问题。如果采用了 :doc:`应用工厂模式 </patterns/appfactories>` ，或者编写可
重用的 :doc:`蓝图 </blueprints>` 以及 :doc:`扩展 </extensions>` 时，就不再需要导入
``app`` 实例了。

Flask 引入了 *应用上下文* 的概念来解决这个问题。你应该使用 :data:`current_app` 代
理，它指向处理当前活动的应用对象，而不是直接引用 ``app``。

在处理请求时，Flask 自动将一个应用上下文 *入栈* 。视图函数、错误处理函数和其他在请求
中运行的函数均可访问到 :data:`current_app`。

Flask 也会在运行用 ``@app.cli.command()`` 注册到 :attr:`Flask.cli` 的 CLI 命令时
自动将一个应用上下文入栈。

.. _lifetime-of-the-context:

上下文的生命周期
-----------------------

应用上下文可以根据需要创建和销毁。当 Flask 应用开始处理请求时，会将一个应用上下文和
一个 :doc:`请求上下文 </reqcontext>` 入栈。当请求结束时，则将应用上下文和请求上下文
出栈。通常应用上下文的生命周期与请求上下文一致。

更多关于上下文工作机制和请求的完整生命周期的信息见 :doc:`/reqcontext` 部分。

.. _manually-push-a-context:

手动入栈上下文
---------------

如果你在应用上下文之外的地方访问 :data:`current_app` 或其他依赖应用上下文的东西，你
将会看到这样的报错信息：

.. code-block:: pytb

    RuntimeError: Working outside of application context.

    This typically means that you attempted to use functionality that
    needed to interface with the current application object in some way.
    To solve this, set up an application context with app.app_context().

如果你是在配置应用时遇到此错误，比如初始化扩展时。因为此时你可以直接访问到 ``app``，
你就可以手动入栈一个上下文。配合 ``with`` 块级语句调用 :meth:`~Flask.app_context`，
块中的内容即可正常访问到 :data:`current_app`::

    def create_app():
        app = Flask(__name__)

        with app.app_context():
            init_db()

        return app

如果你是在与配置应用无关的位置遇到这个错误，这大多意味着你应该把报错涉及的代码转移到
视图函数或是 CLI 命令中。

.. _storing-data:

存储数据
--------------

应用上下文是一个存储在请求、CLI 命令中共用数据的绝佳位置。Flask 为此提供了
:data:`g object <g>` 对象。这是一个简单的命名空间对象，生命周期与应用上下文一样。

.. note::
    ``g`` 对象的名称源自“全局（Global）”，但只引用 *上下文生命周期内* 的全局数据。
    在上下文销毁后，``g`` 对象上的数据也将丢失，也即不应该用于存储跨请求的数据。请用
    :data:`session` 或数据库来存储跨请求的数据。

:data:`g` 的一般用法是管理请求中的资源。

1.  如果 ``X`` 不存在，``get_X()`` 则创建资源 ``X``，并缓存为 ``g.X``。
2.  ``teardown_X()`` 关闭或释放资源已存在的资源 ``X``。这个函数应该注册为
    :meth:`~Flask.teardown_appcontext` 的处理函数。

例如，你可以用这个模式管理数据库连接::

    from flask import g

    def get_db():
        if 'db' not in g:
            g.db = connect_to_database()

        return g.db

    @app.teardown_appcontext
    def teardown_db():
        db = g.pop('db', None)

        if db is not None:
            db.close()

在请求内，每次调用 ``get_db()`` 均返回相同的数据库连接，并会在请求结束时自动关闭这个
数据库连接。

你可以用 :class:`~werkzeug.local.LocalProxy` 从 ``get_db()`` 创建一个上下文局域
变量::


    from werkzeug.local import LocalProxy
    db = LocalProxy(get_db)

访问 ``db`` 时，其内部就会调用 ``get_db``，如同 :data:`current_app` 的工作方式。

----

如果你正在编写扩展，:data:`g` 应该保留给用户代码。你应该直接在上下文中存储内部数据，
并且确保使用独一无二的命名。访问 :data:`_app_ctx_stack.top <_app_ctx_stack>` 即可
获取当前的应用上下文。更多信息见 :doc:`extensiondev`。

.. _events-and-signals:

事件与信号
------------------

当应用上下文出栈时，应用会调用注册到 :meth:`~Flask.teardown_appcontext` 的函数。

当 :data:`~signals.signals_available` 为 ``True`` 时，还会发出
:data:`appcontext_pushed`、:data:`appcontext_tearing_down` 和
:data:`appcontext_popped` 信号。
