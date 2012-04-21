.. _tutorial-setup:

步骤 2: 应用设置代码
==============================

现在我们已经有了数据库模式，我们可以创建应用的模块了。让我们叫它 `flaskr.py` ，
并放置在 `flaskr` 目录下。为面向初学者，我们会添加所有需要的导入像配置的章节中
一样。对于小应用，直接把配置放在主模块里，正如我们现在要做的一样，是可行的。但
是，一个更简洁的方案是创建独立的 `.ini` 或 `.py` 文件，并载入或导入里面的值。

`flaskr.py` 中 ::

    # all the imports
    import sqlite3
    from flask import Flask, request, session, g, redirect, url_for, \
         abort, render_template, flash

    # configuration
    DATABASE = '/tmp/flaskr.db'
    DEBUG = True
    SECRET_KEY = 'development key'
    USERNAME = 'admin'
    PASSWORD = 'default'

接下来我们要创建真正的应用，并且在同一个文件 `flaskr.py` 中配置并初始化::

    # create our little application :)
    app = Flask(__name__)
    app.config.from_object(__name__)

:meth:`~flask.Config.from_object` 会遍历给定的对象（如果它是一个字符串，则
会导入它），搜寻里面定义的全部大写的变量。这种情况，配置文件就是我们上面写
的几行代码。你也可以将他们分开存储到多个文件。


从一个配置文件导入配置通常是个好主意。 :meth:`~flask.Config.from_envvar`
也能做到，用它替换上面的 :meth:`~flask.Config.from_object` 一行::

    app.config.from_envvar('FLASKR_SETTINGS', silent=True)

这种方法我们可以设置一个名为 :envvar:`FLASKR_SETTINGS` 环境变量来设定一个配置
文件载入后是否覆盖默认值。静默开关告诉 Flask 不去关心这个环境变量键值是否存在。

我们需要 `secret_key` 来保证客户端会话的安全。一个尽可能难猜测，尽可能复杂的密
钥是正确的选择。调试标志关系交互式调试器的开启。 *永远不要在生产系统中激活调试
模式* ，因为它将允许用户在服务器上执行代码。

我们还添加了一个快速连接到指定数据库的方法，这个方法用于在请求时打开一个连接，
并且在交互式 Python shell 和脚本中也能使用。这对以后很方便。

::

    def connect_db():
        return sqlite3.connect(app.config['DATABASE'])

最后，如果我们想要把那个文件当做独立应用来运行，我们只需在服务器启动文件的末
尾添加这一行::

    if __name__ == '__main__':
        app.run()

如此我们便可以顺利开始运行这个应用，使用如下命令::

   python flaskr.py

你将会看见有消息提示你可以访问服务器的地址。
You will see a message telling you that server has started along with
the address at which you can access it.

当你在浏览器中访问服务器获得一个 404 page not found 错误时，是因为我们还没有
任何视图。我们之后再来关注这些。首先我们应该让数据库工作起来。

.. admonition:: 外部可见的服务器

   想要你的服务器公开可见？ :ref:`外部可见的服务器 <public-server>`
   一节有更多信息。

继续 :ref:`tutorial-dbinit` 。
