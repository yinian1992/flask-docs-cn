.. _tutorial-dbinit:

步骤 4: 创建数据库
=============================

正如之前介绍的，Flaskr 是一个数据库驱动的应用，更准确的说法
是，一个由关系数据库系统驱动的应用。关系数据库系统需要一个模
式来决定存储信息的方式。所以在第一次开启服务器之前，要点是创
建模式。

可以通过管道把 `schema.sql` 作为 `sqlite3` 命令的输入来创建这
个模式，命令为如下::

    sqlite3 /tmp/flaskr.db < schema.sql

这种方法的缺点是需要安装 sqlite3 命令，而并不是每个系统都有安
装。而且你必须提供数据库的路径，否则将报错。用函数来初始化数据
库是个不错的想法。

要这么做，我们可以创建一个名为 `init_db` 的函数来初始化数据库。
让我们首先看看代码。只需要把这个函数放在 `flaskr.py` 里的
`connect_db` 函数的后面::

    def init_db():
        with app.app_context():
            db = get_db()
            with app.open_resource('schema.sql', mode='r') as f:
                db.cursor().executescript(f.read())
            db.commit()

那么，这段代码会发生什么？还记得吗？上个章节中提到，应用环境在
每次请求传入时创建。这里我们并没有请求，所以我们需要手动创建一
个应用环境。 :data:`~flask.g` 在应用环境外无法获知它属于哪个应
用，因为可能会有多个应用同时存在。

``with app.app_context()`` 语句为我们建立了应用环境。在 with
语句的内部， :data:`~flask.g` 对象会与 ``app`` 关联。在语句的
结束处，会释放这个关联兵执行所有销毁函数。这意味着数据库连接在
提交后断开。

应用对象的 :func:`~flask.Flask.open_resource` 方法是一个很方便
的辅助函数，可以打开应用提供的资源。这个函数从资源所在位置（
你的 `flaskr` 文件夹）打开文件，并允许你读取它。我们在此用它来
在数据库连接上执行脚本。

SQLite 的数据库连接对象提供了一个游标对象。游标上有一个方法可
以执行完整的脚本。最后我们只需提交变更。SQLite 3 和其它支持事
务的数据库只会在你显式提交的时候提交。

现在可以在 Python shell 导入并调用这个函数来创建数据库::

>>> from flaskr import init_db
>>> init_db()

.. admonition:: 故障排除

   如果你遇到了表无法找到的异常，请检查你是否确实调用过
   `init_db` 函数并且表的名称是正确的（比如弄混了单数和复数）。


阅读 :ref:`tutorial-views` 以继续。
