.. mongokit-pattern:

在 Flask 中使用 MongoKit
=========================

近些日子，使用基于文档的数据库而不是基于表的关系数据库变得越来越流行。
这一方案展示了如何使用文档映射库 MongoKit ，来与 MongoDB 交互。

这一方案的使用需要一个可用的 MongoDB 服务器，并且安装有 MongoKit 库。

使用 MongoKit 有两种常用的方法，我们将会逐一介绍:

显式调用
-----------

MongoKit 的默认行为是这种显式调用的方法。这种方法跟 Django 或者 SQLAlchemy
扩展显示调用扩展大体精神是相同的。

下面是一个 `app.py` 模块的例子::

    from flask import Flask
    from mongokit import Connection, Document

    # configuration
    MONGODB_HOST = 'localhost'
    MONGODB_PORT = 27017

    # create the little application object
    app = Flask(__name__)
    app.config.from_object(__name__)

    # connect to the database
    connection = Connection(app.config['MONGODB_HOST'],
                            app.config['MONGODB_PORT'])


要定义您的模型，只需编写一个从 MongoKit 导入的 `Document` 类的子类。如果您
已经看过了 SQLAlchemy 的方案，您可能会奇怪为什么这里没有一个会话，甚至没有
定义 `init_db` 函数。一方面， MongoKit 并没有类似会话这种东西。这有时会增加
代码量，但是同时也使得数据库操作非常高效。另一方面， MongoDB 是没有模式的。
这意味着您在相同的插入查询，可以使用不同的数据结构。 MongoKit 本身也是没有
模式的。但是实现了一些用来确保数据完整的验证。

以下是一个文档的例子 (您可以将这个也放进 `app.py` 文件里)::

    def max_length(length):
        def validate(value):
            if len(value) <= length:
                return True
            raise Exception('%s must be at most %s characters long' % length)
        return validate

    class User(Document):
        structure = {
            'name': unicode,
            'email': unicode,
        }
        validators = {
            'name': max_length(50),
            'email': max_length(120)
        }
        use_dot_notation = True
        def __repr__(self):
            return '<User %r>' % (self.name)

    # register the User document with our current connection
    connection.register([User])


这个例子向您展示了怎么定义您自己的结构(名为 structure)、一个最大字符长度
的验证器以及使用 Monkit 的一项名为 `use_dot_notation` 的特性。某人情况下
MongoKit 按照字典的方式行为，但是将 `use_dot_notation` 为真之后，您可以
像您在几乎所有的 ORM 当中那样，使用点运算符来分割属性的方式访问您的文档。

向数据库里添加数据的方法如下所示:

>>> from yourapplication.database import connection
>>> from yourapplication.models import User
>>> collection = connection['test'].users
>>> user = collection.User()
>>> user['name'] = u'admin'
>>> user['email'] = u'admin@localhost'
>>> user.save()

注意，MongoKit 在列的类型方面有些严格，您必须使用一个通常的 `unicode` 来
作为 `name` 和 `email` 的类型，而不是普通的 `str` 类型。

查询也很简单:

>>> list(collection.User.find())
[<User u'admin'>]
>>> collection.User.find_one({'name': u'admin'})
<User u'admin'>

.. _MongoKit: http://bytebucket.org/namlook/mongokit/


PyMongo 兼容层
---------------------------

如果您想直接使用 PyMongo 。 您也可以利用 MongoKit 实现。如果您希望应用程序实现
最佳的表现，您也许希望使用这种方法。注意，例子并没有展示配合 Flask 使用的具体
方法。请参考上面 MongoKit 的例子代码::

    from MongoKit import Connection

    connection = Connection()

插入数据可以使用 `insert` 方法。我们必须先获得一个连接。这跟
在 SQL 的世界使用表有些类似。

>>> collection = connection['test'].users
>>> user = {'name': u'admin', 'email': u'admin@localhost'}
>>> collection.insert(user)

print list(collection.find())
print collection.find_one({'name': u'admin'})

MongoKit 将会为我们自动提交修改。

查询数据库，您要直接使用数据库连接:

>>> list(collection.find())
[{u'_id': ObjectId('4c271729e13823182f000000'), u'name': u'admin', u'email': u'admin@localhost'}]
>>> collection.find_one({'name': u'admin'})
{u'_id': ObjectId('4c271729e13823182f000000'), u'name': u'admin', u'email': u'admin@localhost'}

返回的结果也同样是类字典的对象:

>>> r = collection.find_one({'name': u'admin'})
>>> r['email']
u'admin@localhost'

关于 MongoKit 的更多信息，请访问
`website <https://github.com/namlook/mongokit>`_.
