.. _sqlite3:

在 Flask 中使用 SQLite 3
=========================

In Flask you can implement the opening of database connections at the
beginning of the request and closing at the end with the
:meth:`~flask.Flask.before_request` and :meth:`~flask.Flask.teardown_request`
decorators in combination with the special :class:`~flask.g` object.

在 Flask 中，在请求开始的时候用 :meth:`~flask.Flask.before_request` 装饰器实现
打开数据库连接的代码，然后在请求结束的时候用 :meth:`~flask.Flask.before_request`
装饰器关闭数据库连接。在这个过程中需要配合 :class:`~flask.g` 对象。

于是，在 Flask 里一个使用 SQLite 3 的简单例子就是下面这样::

    import sqlite3
    from flask import g

    DATABASE = '/path/to/database.db'

    def connect_db():
        return sqlite3.connect(DATABASE)

    @app.before_request
    def before_request():
        g.db = connect_db()

    @app.teardown_request
    def teardown_request(exception):
        if hasattr(g, 'db'):
            g.db.close()

.. note::

   请记住，teardown request 在请求结束时总会运行，即使 before-request 处理器
   运行失败或者从未运行过。我们需要确保数据库连接在关闭的时候在那里。

按需连接
-----------------

上述方法的缺陷在于，它只能用于 Flask 会执行 before-request 处理器的场合下
有效，如果您想要在一个脚本或者 Python 的交互式终端中访问数据库。纳闷您必须
做一些类似下面的代码的事情::

    with app.test_request_context():
        app.preprocess_request()
        # now you can use the g.db object

为了激发连接代码的执行，使用这种方式的话，您将不能离开对请求上下文的依赖。
但是您使用以下方法可以使应用程序在必要时才连接::

    def get_connection():
        db = getattr(g, '_db', None)
        if db is None:
            db = g._db = connect_db()
        return db

缺点就是，您必须使用 ``db = get_connection()`` 而不是仅仅直接使用 ``g.db`` 
来访问数据库连接。

.. _easy-querying:

方便查询
-------------

现在在每个请求处理函数里，您都可以访问 `g.db` 来获得当前打开的数据库连接。
此时，用一个辅助函数简化 SQLite 的使用是相当有用的::

    def query_db(query, args=(), one=False):
        cur = g.db.execute(query, args)
        rv = [dict((cur.description[idx][0], value)
                   for idx, value in enumerate(row)) for row in cur.fetchall()]
        return (rv[0] if rv else None) if one else rv

相比起直接使用原始的数据指针和连接对象。这个随手即得的小函数让操作数据库的操作更为轻松。
像下面这样使用它::

    for user in query_db('select * from users'):
        print user['username'], 'has the id', user['user_id']

如果您只希望得到一个单独的结果::

    user = query_db('select * from users where username = ?',
                    [the_username], one=True)
    if user is None:
        print 'No such user'
    else:
        print the_username, 'has the id', user['user_id']

将变量传入 SQL 语句时，使用一个问号在语句之前。然后将参数以链表的形式穿进去。
永远不要直接将他们添加到 SQL 语句中以字符串形式传入，这样做将会允许恶意用户
以 `SQL 注入 <http://en.wikipedia.org/wiki/SQL_injection>`_ 的方式攻击您的应用。

初始化数据库模型
-----------------

关系数据库需要一个模型来定义储存数据的模式，所以应用程序通常携带一个 `schema.sql`
文件用于创建数据库。提供一个特定的函数来根据这个文件指定的模型创建数据库是一个不错的
主义，以下的函数就能为您做到这件事::

    from contextlib import closing
    
    def init_db():
        with closing(connect_db()) as db:
            with app.open_resource('schema.sql') as f:
                db.cursor().executescript(f.read())
            db.commit()

然后您就可以在 Python 的交互式终端中创建一个这样的数据库:

>>> from yourapplication import init_db
>>> init_db()
