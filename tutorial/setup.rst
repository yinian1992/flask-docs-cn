.. _tutorial-setup:

步骤 2: 应用设置代码
==============================

现在我们已经有了数据库模式，我们可以创建应用的模块了。让我们把它
叫做 `flaskr.py` ，并放置在 `flaskr` 目录下。我们从添加所需的导
入语句和添加配置部分开始。对于小型应用，可以直接把配置放在主模块
里，正如我们现在要做的一样。但更简洁的方案是创建独立的 `.ini` 或
`.py` 文件，并载入或导入里面的值。

首先在 `flaskr.py` 里导入::

    # all the imports
    import os
    import sqlite3
    from flask import Flask, request, session, g, redirect, url_for, abort, \
         render_template, flash

:class:`~flask.Config` 对象的用法如同字典，所以我们可以用新值更新
它。

.. admonition:: 数据库路径

    操作系统有进程当前工作目录的概念。不幸的是，你在 Web 应用中不能
    依赖此概念，因为你可能会在相同的进程中运行多个应用。

    为此，提供了 ``app.root_path`` 属性以获取应用的路径。配合
    ``os.path`` 模块使用，轻松可达任意文件。在本例中，我们把数据库
    放在根目录下。

    对于实际生产环境的应用，推荐使用 :ref:`instance-folders` 。


通常，加载一个单独的、环境特定的配置文件是个好主意。Flask 允许你导
入多份配置，并且使用最后的导入中定义的设置。这使得配置设定过程更可
靠。 :meth:`~flask.Config.from_envvar` 可用于达此目的。

    app.config.from_envvar('FLASKR_SETTINGS', silent=True)

只需设置一个名为 :envvar:`FLASKR_SETTINGS` 的环境变量，指向要加载的
配置文件。启用静默模式告诉 Flask 在没有设置该环境变量的情况下噤声。

此外，你可以使用配置对象上的 :meth:`~flask.Config.from_object` 方
法，并传递一个模块的导入名作为参数。Flask 会从这个模块初始化变量。
注意，只有名称全为大写字母的变量才会被采用。

`secret_key` 是保证客户端会话的安全的要点。正确选择一个尽可能难猜
测、尽可能复杂的密钥。调试标志关系交互式调试器的开启。 
*永远不要在生产系统中激活调试模式* ，因为它将允许用户在服务器上执
行代码。

我们还添加了一个让连接到指定数据库变得很简单的方法，这个方法用于
在请求时开启一个数据库连接，并且在交互式 Python shell 和脚本中
也能使用。这为以后的操作提供了相当的便利。我们创建了一个简单的
SQLite 数据库的连接，并让它用 :class:`sqlite3.Row` 表示数据库中
的行。这使得我们可以通过字典而不是元组的形式访问行::

    def connect_db():
        """Connects to the specific database."""
        rv = sqlite3.connect(app.config['DATABASE'])
        rv.row_factory = sqlite3.Row
        return rv

最后，如果我们想要把这个文件当做独立应用来运行，我们只需在可启动
服务器文件的末尾添加这一行::

    if __name__ == '__main__':
        app.run()

如此我们便可以开始顺利运行这个应用，使用如下命令::

   python flaskr.py

你将会看见有消息告诉你访问该服务器的地址。

当你在浏览器中访问服务器遇到一个 404 page not found 错误时，
是因为我们还没有任何视图。我们之后再来关注视图。首先我们应该让数
据库工作起来。

.. admonition:: 外部可见的服务器

   想要你的服务器公开可见？
    :ref:`外部可见的服务器 <public-server>` 一节有更多信息。

阅读 :ref:`tutorial-dbinit` 以继续。
