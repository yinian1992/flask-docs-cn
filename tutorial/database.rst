.. currentmodule:: flask

.. _define-and-access-the-database:

数据库的定义与访问
===================

在本教程中，应用将使用 `SQLite`_ 数据库来存储用户和文章。Python 自带的
:mod:`sqlite3` 就提供了 SQlite 支持。

SQLite 用起来很方便，它不需要配置独立的数据库服务器即可使用，而且 Python 内置支持。
尽管如此，如果并发请求试图同时写入数据库，那么写入请求将会顺序处理，明显会降低响应速
度。小规模应用无须担心这种情况。在你的应用规模扩大以后，你才会需要寻求其他数据库。

本教程不会详细介绍 SQL。如果你还没有了解过 SQL，可以查看 SQLite 文档中的 `语言`_ 章
节中的相关叙述。

.. _SQLite: https://sqlite.org/about.html
.. _语言: https://sqlite.org/lang.html


.. _connect-to-the-database:

连接到数据库
-----------------------

首先，你需要创建一个数据库连接才能使用 SQLite 数据库，对于大多数其他的提供数据库支持
的 Python 库而言也是如此。任何查询和操作都将在这个连接里进行，所有工作结束后则关闭这
个连接。

在 Web 应用中，数据库连接经常是与请求绑定的。在处理请求的某个步骤上创建数据库连接，
然后在发送响应前关闭数据库连接。

.. code-block:: python
    :caption: ``flaskr/db.py``

    import sqlite3

    import click
    from flask import current_app, g
    from flask.cli import with_appcontext


    def get_db():
        if 'db' not in g:
            g.db = sqlite3.connect(
                current_app.config['DATABASE'],
                detect_types=sqlite3.PARSE_DECLTYPES
            )
            g.db.row_factory = sqlite3.Row

        return g.db


    def close_db(e=None):
        db = g.pop('db', None)

        if db is not None:
            db.close()

:data:`g` 是一个特殊的对象，它对于每个请求都是唯一的。这个对象用于存储在请求处理过程
中多个函数可能需要访问的数据。在一个请求里，如果 ``get_db`` 被多次调用，会返回已存
储的数据库连接并重用，而不是重新创建一个。

:data:`current_app` 是另一个特殊的对象，指向当前处理请求的 Flask 应用。既然你采用了
应用工厂，那么在代码其余部分也就没有可用的应用对象。``get_db`` 会在应用创建时或处理请
求时被调用，此时就会用到 :data:`current_app` 。

:func:`sqlite3.connect` 发起一个 ``DATABASE`` 配置项指向的数据库文件。这个文件在你
下一步初始化数据库之前尚不存在。

:class:`sqlite3.Row` 让数据库连接以字典的形式返回行。这使得你可以通过列名访问数据。

``close_db`` 通过检查 ``g.db`` 是否设置了一个有效的值来确认已有建立好的连接。如果连
接存在，那么关闭连接。之后，在应用工厂中向应用引入 ``close_db`` 函数，在请求结束后调
用。

.. _create-the-tables:

创建数据库表
-----------------

在  SQLite 中，数据以 *表* 和 *列* 的形式存储。在存储和取回数据之前，你需要先创建表。
Flaskr 将用 ``user`` 表存储用户信息，``post`` 表存储文章。用下面的命令创建一个用以创
建空表的 SQL 文件：

.. code-block:: sql
    :caption: ``flaskr/schema.sql``

    DROP TABLE IF EXISTS user;
    DROP TABLE IF EXISTS post;

    CREATE TABLE user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE post (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES user (id)
    );

在 ``db.py`` 文件中添加运行这些 SQL 命令的 Python 函数：

.. code-block:: python
    :caption: ``flaskr/db.py``

    def init_db():
        db = get_db()

        with current_app.open_resource('schema.sql') as f:
            db.executescript(f.read().decode('utf8'))


    @click.command('init-db')
    @with_appcontext
    def init_db_command():
        """Clear the existing data and create new tables."""
        init_db()
        click.echo('Initialized the database.')

:meth:`open_resource() <Flask.open_resource>` 用于打开相对于 ``flaskr`` 包的文
件，这使得你可以在不知道应用之后要部署到什么位置的情况下创建文件。 ``get_db`` 返回
数据库连接，执行从文件中读取的命令。

:func:`click.command` 定义了一个名为 ``init-db`` 的命令行命令，调用 ``init_db``
函数并向用户展示执行成功的信息。关于如何编写命令的更多细节，参看 :ref:`cli` 部分。

.. _register-with-the-application:

注册到应用
-------------

``close_db`` 和 ``init_db_command`` 函数需要在应用实例上注册，否则应用不能调用它
们。然而由于你采用了应用工厂函数，在函数内并没有可用的应用实例。作为替代，你可以编写
一个处理接受应用为参数并完成注册的函数。

.. code-block:: python
    :caption: ``flaskr/db.py``

    def init_app(app):
        app.teardown_appcontext(close_db)
        app.cli.add_command(init_db_command)

:meth:`app.teardown_appcontext() <Flask.teardown_appcontext>` 让 Flask 在返回
响应之后的清理工作中调用注册的函数。

:meth:`app.cli.add_command() <click.Group.add_command>` 添加一个新的命令，这个命
令可以被 ``flask`` 命令调用。

在应用工厂中导入并调用这个函数。把新代码放在工厂函数的最后，但要在返回应用的语句之前。

.. code-block:: python
    :caption: ``flaskr/__init__.py``

    def create_app():
        app = ...
        # existing code omitted

        from . import db
        db.init_app(app)

        return app


.. _initialize-the-database-file:

初始化数据库
----------------

现在 ``init-db`` 已经被注册到了应用上，可以用 ``flask`` 命令调用，就像上一页中的
``run`` 命令一样。


.. note::

    如果你仍在运行上一页中的服务器，你可以停掉服务器再运行命令，或是直接在新的终端中
    运行。如果你打开了新终端，注意要进入项目目录并激活 :ref:`install-activate-env`
    章节中的虚拟环境，还有要设置前一页中的 ``FLASK_APP`` 和 ``FLASK_ENV`` 环境变
    量。

运行 ``init-db`` 命令：

.. code-block:: none

    flask init-db
    Initialized the database.

之后在项目的实力文件夹中就会有一个 ``flaskr.sqlite`` 文件了。

请继续阅读 :doc:`views` 。
