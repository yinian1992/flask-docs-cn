.. _sqlalchemy-pattern:

在 Flask 中使用 SQLAlchemy
==========================

很多人更倾向于使用 `SQLAlchemy`_ 进行数据库操作。在这种情况下，建议您使用
包的而不是模块的方式组织您的应用代码，并将所有的模型放置到一个单独的模块中
(:ref:`larger-applications`)。尽管这并非必要，但是这么做将会让程序的结构更加
明晰。

使用 SQLAlchemy 有四种常用的方法，我们在下面列出了这几种方法的基本使用
框架:

Flask-SQLAlchemy 扩展
--------------------------

因为 SQLAlchemy 是一个常用的数据库抽象层和数据库关系映射包(ORM)，并且需要
一点点设置才可以使用，因此存在一个 Flask 扩展帮助您操作它。如果您想要快速
开始使用，那么我们建议您使用这种方法。

您可以从 `PyPI <http://pypi.python.org/pypi/Flask-SQLAlchemy>`_ 
下载到 `Flask-SQLAlchemy`_ 

.. _Flask-SQLAlchemy: http://packages.python.org/Flask-SQLAlchemy/


显式调用
----------------

SQLAlchemy 中的 declarative 扩展是最新的使用 SQLAlchemy 的方法。它允许您
同时定义表和模型，就像 Django 一样工作。除了下文所介绍的内容外，我们建议您
参考 `declarative`_ 扩展的官方文档。

这是一个 `database.py` 模块的例子::

    from sqlalchemy import create_engine
    from sqlalchemy.orm import scoped_session, sessionmaker
    from sqlalchemy.ext.declarative import declarative_base

    engine = create_engine('sqlite:////tmp/test.db', convert_unicode=True)
    db_session = scoped_session(sessionmaker(autocommit=False,
                                             autoflush=False,
                                             bind=engine)) 
    Base = declarative_base()
    Base.query = db_session.query_property()

    def init_db():
        # 在这里导入所有的可能与定义模型有关的模块，这样他们才会合适地
        # 在 metadata 中注册。否则，您将不得不在第一次执行 init_db() 时
        # 先导入他们。
        import yourapplication.models
        Base.metadata.create_all(bind=engine)

为了定义您的模型，仅仅构造一个上面代码编写的 `Base` 类的子类。如果您好奇
为何我们在这里不用担心多线程的问题(就像我们在先前使用 :data:`~flask.g` 
对象操作 SQLite3 的例子一样):那是因为 SQLAlchemy 已经在
:class:`~SQLAlchemy.orm.scoped_session` 类当中为我们完成了这些任务。

在您的应用当中以一个显式调用 SQLAlchemy , 您只需要将如下代码放置在您应用
的模块中。Flask 将会在请求结束时自动移除数据库会话::

    from yourapplication.database import db_session

    @app.teardown_request
    def shutdown_session(exception=None):
        db_session.remove()

这是一个模型的例子(将代码放入 `models.py` 或类似文件中)::

    from sqlalchemy import Column, Integer, String
    from yourapplication.database import Base

    class User(Base):
        __tablename__ = 'users'
        id = Column(Integer, primary_key=True)
        name = Column(String(50), unique=True)
        email = Column(String(120), unique=True)

        def __init__(self, name=None, email=None):
            self.name = name
            self.email = email

        def __repr__(self):
            return '<User %r>' % (self.name)

您可以使用 `init_db` 函数创建一个数据库:

>>> from yourapplication.database import init_db
>>> init_db()

按照如下方式将数据实体插入数据库:

>>> from yourapplication.database import db_session
>>> from yourapplication.models import User
>>> u = User('admin', 'admin@localhost')
>>> db_session.add(u)
>>> db_session.commit()

查询代码也很简单:

>>> User.query.all()
[<User u'admin'>]
>>> User.query.filter(User.name == 'admin').first()
<User u'admin'>

.. _SQLAlchemy: http://www.sqlalchemy.org/
.. _declarative:
   http://www.sqlalchemy.org/docs/orm/extensions/declarative.html

手动实现 ORM
--------------------------------

手动实现 ORM (对象关系映射) 相比前面的显式调用方法，既有一些优点，也有一些缺点。
主要差别在于这里的数据表和模型是分开定义的，然后再将其映射起来。这提供了更大的灵活性，
但是会增加了代码量。通常来说它和上面显式调用的工作的方式很相似，所以请确保您的应用已经
被合理分割到了包中的不同模块中。

这是一个 `database.py` 模块的例子::

    from sqlalchemy import create_engine, MetaData
    from sqlalchemy.orm import scoped_session, sessionmaker

    engine = create_engine('sqlite:////tmp/test.db', convert_unicode=True)
    metadata = MetaData()
    db_session = scoped_session(sessionmaker(autocommit=False,
                                             autoflush=False,
                                             bind=engine)) 
    def init_db():
        metadata.create_all(bind=engine)

与显式调用相同，您需要在请求结束后关闭数据库会话。将下面的代码
放到您的应用程序模块中::

    from yourapplication.database import db_session

    @app.teardown_request
    def shutdown_session(exception=None):
        db_session.remove()

下面是一个数据表和模型的例子(将他们放到 `models.py` 当中)::

    from sqlalchemy import Table, Column, Integer, String
    from sqlalchemy.orm import mapper
    from yourapplication.database import metadata, db_session

    class User(object):
        query = db_session.query_property()

        def __init__(self, name=None, email=None):
            self.name = name
            self.email = email

        def __repr__(self):
            return '<User %r>' % (self.name)

    users = Table('users', metadata,
        Column('id', Integer, primary_key=True),
        Column('name', String(50), unique=True),
        Column('email', String(120), unique=True)
    )
    mapper(User, users)

查询和插入操作和上面所给出的例子是一样的。


SQL 抽象层
---------------------

如果您仅用到数据库系统和 SQL 抽象层，那么您只需要引擎部分::

    from sqlalchemy import create_engine, MetaData

    engine = create_engine('sqlite:////tmp/test.db', convert_unicode=True)
    metadata = MetaData(bind=engine)

然后您就可以像上文的例子一样声明数据表，或者像下面这样自动加载他们::

    users = Table('users', metadata, autoload=True)

您可以使用 `insert` 方法插入数据，我们需要先获取一个数据库连接，这样
我们就可以使用“事务”了:

>>> con = engine.connect()
>>> con.execute(users.insert(), name='admin', email='admin@localhost')

SQLAlchemy 将会为我们自动提交对数据库的修改。

查询数据可以直接通过数据库引擎，也可以使用一个数据库连接:

>>> users.select(users.c.id == 1).execute().first()
(1, u'admin', u'admin@localhost')

返回的结果也是字典样式的元组:

>>> r = users.select(users.c.id == 1).execute().first()
>>> r['name']
u'admin'

您也可以将 SQL 语句的字符串传入到
:meth:`~sqlalchemy.engine.base.Connection.execute` 函数中:

>>> engine.execute('select * from users where id = :1', [1]).first()
(1, u'admin', u'admin@localhost')

更多 SQLAlchemy 相关信息，请参考 `其网站 <http://sqlalchemy.org/>`_.
