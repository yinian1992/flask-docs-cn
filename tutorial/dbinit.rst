.. _tutorial-dbinit:

步骤 3: 创建数据库
=============================

Flaskr 是一个数据库驱动的应用，如同之前所概括的，更准确的说法是，一个由
关系数据库系统驱动的应用。关系数据库系统需要一个模式来决定存储信息的方式。
所以在第一次开启服务器之前，要点是创建模式。

可以通过管道把 `schema.sql` 作为 `sqlite3` 命令的输入来创建这个模式，命
令如下::

    sqlite3 /tmp/flaskr.db < schema.sql

这种方法的缺点是需要安装 sqlite3 命令，而并不是每个系统都有安装。而且你必
须提供数据库的路径，否则将报错。添加一个函数来对初始化数据库是个不错的想法。

如果你想这么做，你首先要从 contextlib 包中导入 :func:`contextlib.closing`
函数。如果你想使用 Python 2.5 ，那么必须先启用 `with` 声明（ `__future__`
导入必须先于其它的导入）::

    from __future__ import with_statement
    from contextlib import closing

接下来，我们可以创建一个名为 `init_db` 的函数来初始化数据库。为此，我们可以
使用之前定义的 `connect_db` 函数。只需要在 `connect_db` 函数后面添加这个函
数::

    def init_db():
        with closing(connect_db()) as db:
            with app.open_resource('schema.sql') as f:
                db.cursor().executescript(f.read())
            db.commit()

:func:`~contextlib.closing` 助手函数允许我们在 `with` 块中保持数据库连接可
用。应用对象的 :func:`~flask.Flask.open_resource` 方法在其方框外也支持这个
功能，因此可以在 `with` 块中直接使用。这个函数从资源位置（你的 `flaskr` 文
件夹）中打开一个文件，并且允许你读取它。我们在这里用它在数据库连接上执行一
个脚本。

当我们连接到数据库时会得到一个数据库连接对象（这里命名它为 `db` ），这个对
象提供给我们一个数据库指针。指针上有一个可以执行完整脚本的方法。最后我们不
显式地提交更改， SQLite 3 或者其它事务数据库不会这么做。

现在可以在 Python shell 里创建数据库，导入并调用刚才的函数::

>>> from flaskr import init_db
>>> init_db()

.. admonition:: 故障排除

   如果你获得了一个表无法找到的异常，请检查你确实调用了 `init_db` 函数并且
   表的名称是正确的（如单数复数混淆）。


继续 :ref:`tutorial-dbcon`
