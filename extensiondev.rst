.. _extension-dev:

Flask 扩展开发
===========================

Flask，一个微框架，通常需要一些重复的步骤来让第三方库工作。因为在很多时候，
这些步骤可以被分离出，来支持多个项目，就有了 `Flask Extension Registry`_ 。

如果你想要为还没有的功能创建你自己的 Flask 扩展，这份扩展开发指南会帮助你
在很短的时间内让你的应用跑起来并且感到像用户一样期待你的扩展运转。

.. _Flask Extension Registry: http://flask.pocoo.org/extensions/

剖析扩展
-----------------------

所有的扩展都位于一个叫做 ``flask_something`` 的包，其中“ something ”是你
想要连接的库的名字。那么，例如当你计划要为 Flask 添加一个叫做 `simplexml`
的库的支持时，你应该把你扩展的包命名为 ``flask_simplexml`` 。

实际的扩展名（人类可读的名称）无论如何会是“Flask-SimpleXML”之类的东西。
确保在名字中包含“Flask”并注意大小写。这是用户可以在他们的 `setup.py` 文
件中注册你的扩展为依赖的方式。

Flask 设立了一个叫做 :data:`flask.ext` 的重定向包，用户应该从这个包导入
扩展。例如，如果你有一个叫做 `flask_something` 的包，用户应该用
``flask.ext.something`` 的方式导入。这样做是为了从老命名空间的包过度。
详情见 :ref:`ext-import-transition` 。

但是扩展如何看起来像扩展？一个扩展必须保证它可以同时在多个 Flask 应用中工
作。这是必要条件，因为许多人会使用类似 :ref:`app-factories` 的模式来创建
应用来进行单元测试或是支持多套配置。因此，你的应用支持这种行为非常重要。

最重要的是，扩展必须与一个 `setup.py` 文件一起装配，并且在 PyPI 上注册。同
样，开发 checkout 链接也应该能工作，这样才可以在 virtualenv 中容易地安装开
发版本，而不是手动下载库。

Flask 扩展必须以 BSD 或 MIT 或更自由的许可证来许可，这样才能被列入到 Flask
Extension Registry 。记住 Flask Extension Registry 是一个人工维护的地方，
并且会视这些库的行为来决定是否进行必要的提前审查。

"Hello Flaskext!"
-----------------

那么让我们开始创建这样一个 Flask 扩展。我们这里想要创建的扩展会提供 SQLite3
最基础的支持。

首先我们创建下面的目录结构::

    flask-sqlite3/
        flask_sqlite3.py
        LICENSE
        README

这里是最重要的文件的内容:

setup.py
````````
下一个绝对需要的文件是 `setup.py` ，用于安装你的 Flask 扩展。你可以使用下
面的内容::

    """
    Flask-SQLite3
    -------------

    This is the description for that library
    """
    from setuptools import setup


    setup(
        name='Flask-SQLite3',
        version='1.0',
        url='http://example.com/flask-sqlite3/',
        license='BSD',
        author='Your Name',
        author_email='your-email@example.com',
        description='Very short description',
        long_description=__doc__,
        py_modules=['flask_sqlite3'],
        # if you would be using a package instead use packages instead
        # of py_modules:
        # packages=['flask_sqlite3'],
        zip_safe=False,
        include_package_data=True,
        platforms='any',
        install_requires=[
            'Flask'
        ],
        classifiers=[
            'Environment :: Web Environment',
            'Intended Audience :: Developers',
            'License :: OSI Approved :: BSD License',
            'Operating System :: OS Independent',
            'Programming Language :: Python',
            'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
            'Topic :: Software Development :: Libraries :: Python Modules'
        ]
    )

这有相当多的代码，但是你实际上可以从现有的扩展中直接复制/粘贴，并修改相应的
内容。

flask_sqlite3.py
````````````````

现在这个是你的扩展放代码的位置。但是这样一个扩展到底看起来是什么样？
最佳实践是什么？继续阅读，你会有一些认识。


初始化扩展
-----------------------

许多扩展会需要某种类型的初始化步骤。比如，想象一个应用像文档中建议的一样
(:ref:`sqlite3`) 正在连接到 SQLite。那么，扩展如何获知应用对象的名称？

相当简单：你传递应用对象到它。

有两种推荐的初始化应用的方式:

初始化函数:

    如果你的扩展叫做 `helloworld` ，你应该有一个名为
    ``init_helloworld(app[, extra_args])`` 的函数来为应用初始化扩展。它
    可以附加在处理器前/后等位置。

类:
    类的工作大多像初始化函数，但可以在之后进一步更改其行为。例如
    `OAuth 扩展`_ 的工作方式，一个 `OAuth` 对象提供一些诸如
    `OAuth.remote_app` 的助手函数来创建一个使用 OAuth 的远程应用的引用。

用什么取决于你想要什么。对于 SQLite 3 扩展，我们会使用基于类的方法，因为它
提供用户一个可以承担打开和关闭数据库连接的对象。

关于类，重要的是它们鼓励在模块层内共享。这种情况下，对象本身在任何情况下
不得存储任何应用的特定状态，而必须可以在不同的应用间共享。

扩展的代码
------------------

下面是用来复制/粘贴的 `flask_sqlite3.py` 的内容::

    import sqlite3
    from flask import current_app

    # Find the stack on which we want to store the database connection.
    # Starting with Flask 0.9, the _app_ctx_stack is the correct one,
    # before that we need to use the _request_ctx_stack.
    try:
        from flask import _app_ctx_stack as stack
    except ImportError:
        from flask import _request_ctx_stack as stack


    class SQLite3(object):

        def __init__(self, app=None):
            self.app = app
            if app is not None:
                self.init_app(app)

        def init_app(self, app):
            app.config.setdefault('SQLITE3_DATABASE', ':memory:')
            # Use the newstyle teardown_appcontext if it's available,
            # otherwise fall back to the request context
            if hasattr(app, 'teardown_appcontext'):
                app.teardown_appcontext(self.teardown)
            else:
                app.teardown_request(self.teardown)

        def connect(self):
            return sqlite3.connect(current_app.config['SQLITE3_DATABASE'])

        def teardown(self, exception):
            ctx = stack.top
            if hasattr(ctx, 'sqlite3_db'):
                ctx.sqlite3_db.close()

        @property
        def connection(self):
            ctx = stack.top
            if ctx is not None:
                if not hasattr(ctx, 'sqlite3_db'):
                    ctx.sqlite3_db = self.connect()
                return ctx.sqlite3_db


那么这是这些代码做的事情:

1.  ``__init__`` 方法接受一个可选的应用对象，并且如果提供，会调用 ``init_app`` 。
2.  ``init_app`` 方法使得 ``SQLite3`` 对象不需要应用对象就可以实例化。这个方法
    支持工厂模式来创建应用。 ``init_app`` 会为数据库设定配置，如果不提供配置，默
    认是一个内存中的数据库。此外， ``init_app`` 方法附加了 ``teardown`` 处理器。
    它会试图使用新样式的应用上下文处理器，并且如果它不存在，退回到请求上下文处理
    器。
3.  接下来，我们定义了 ``connect`` 方法来打开一个数据库连接。
4.  最后，我们添加一个 ``connection`` 属性，首次访问时打开数据库连接，并把它存储
    在上下文。这也是处理资源的推荐方式：在资源第一次使用时惰性获取资源。

    注意这里，我们把数据库连接通过 ``_app_ctx_stack.top`` 附加到应用上下文
    的栈顶。扩展应该使用上下文的栈顶来存储它们自己的信息，并使用足够复杂的
    名称。注意如果应用使用不支持它的老版本的 Flask 我们退回到
    ``_request_ctx_stack.top`` 。

那么为什么我们决定在此使用基于类的方法？因为使用我们的扩展的情况看起来
会是这样::

    from flask import Flask
    from flask_sqlite3 import SQLite3

    app = Flask(__name__)
    app.config.from_pyfile('the-config.cfg')
    db = SQLite3(app)

你之后可以在视图中这样使用数据库::

    @app.route('/')
    def show_all():
        cur = db.connection.cursor()
        cur.execute(...)

同样地，如果你在请求之外，而你在使用支持应用上下文 Flask 0.9 或之后的版本，
你可以用同样的方法使用数据库::

    with app.app_context():
        cur = db.connection.cursor()
        cur.execute(...)

在 `with` 块的最后，销毁处理器会自动执行。

此外， ``init_app`` 方法用于支持创建应用的工厂模式::

    db = Sqlite3()
    # Then later on.
    app = create_app('the-config.cfg')
    db.init_app(app)

记住已审核的 Flask 扩展需要支持用工厂模式来创建应用（下面会解释）。

.. admonition:: ``init_app`` 的注意事项

   如你所见， ``init_app`` 不分配 ``app`` 到 ``self`` 。这是故意的！基于
   类的 Flask 扩展必须只在应用传递到构造函数时在对象上存储应用。这告诉扩
   展：我对使用多个应用没有兴趣。

   当扩展需要找出当前的应用且它没有一个指向其的引用时，必须使用
   :data:`~flask.current_app` 上下文局域变量或用一种你可以显式传递应用的
   方法更改 API 。


使用 _app_ctx_stack
--------------------

在上面的例子中，在每个请求之前，一个 ``sqlite3_db`` 被分配到
``_app_ctx_stack.top`` 。在一个视图函数中，这个变量可以使用 ``SQLite3``
的属性 ``connection`` 来访问。在请求销毁时， ``sqlite3_db`` 连接被关闭。
通过使用这个模式， *相同* 的 sqlite3 数据库连接在请求期间对任何需要它的东
西都是可访问的。

如果 :data:`~flask._app_ctx_stack` 因为用户使用了老版本的 Flask 不存在，
建议退化到限定在请求中的 :data:`~flask._request_ctx_stack` 。


销毁行为
-----------------

*这只在你想要支持 Flask 0.6 和更老版本时有关*

由于在 Flask 0.7 中关于在请求的最后运行的函数的变更，你的应用需要在此格外
小心，如果要继续支持 Flask 的更老版本。下面的模式是一个兼顾新旧的好方法::

    def close_connection(response):
        ctx = _request_ctx_stack.top
        ctx.sqlite3_db.close()
        return response

    if hasattr(app, 'teardown_request'):
        app.teardown_request(close_connection)
    else:
        app.after_request(close_connection)

严格地讲，上面的代码是错误的，因为销毁函数接受异常且典型地不返回任何东西。
尽管如此，因为返回值被丢弃，这刚好会工作，假设中间的代码不触碰传递的参数。

他山之石，可以攻玉
-------------------

本文档只接触了扩展开发中绝对的最小部分，如果你想要了解更多，一个非常好的
主意是查看 `Flask Extension Registry`_ 上已有的扩展。如果你感到失落，也有
`邮件列表`_  和 `IRC 频道`_ 来获取一些漂亮 API 的想法。特别是当你在做之前
没人做过的东西，这会是一个非常好的主意来获得更多投入。这不仅获得人们会想
从扩展中得到什么的想法，也可避免多个开发者重复发明轮子。

记住：良好的 API 设计是困难的，所以请在邮件列表里介绍你的项目，让
其它开发者在 API 设计上助你一臂之力。

最好的 Flask 扩展是那些为 API 共享通用风格的扩展，并且这只在起初就协作时
奏效。


已审核的扩展
-------------------

Flask 也有已审核的扩展的概念。已审核的扩展被作为 Flask 自身的一部分来测
试来保证在新版本中不会破坏。这些已审核的扩展会在 
`Flask Extension Registry`_ 中列出，并有相应的标记。如果你想要自己的扩展
通过审核，你需要遵守下面的指导方针:

0.  一个通过审核的 Flask 扩展需要一个维护者。如果一个扩展作者想要超越项目，
    项目应该寻找一个新的维护者，包括完整的源码托管过渡和 PyPI 访问。如果没
    有可用的维护者，请给 Flask 核心团队访问权限。
1.  一个通过审核的 Flask 扩展必须确切地提供一个名为 ``flask_extensioname`` 的
    包或模块。它们也可能驻留在 ``flaskext`` 命名空间包内部，虽然现在这不被推荐。
2.  它必须伴随一个可以使用 ``make test`` 或 ``python setup.py test`` 的调用测
    试套件。对于用 ``make test`` 测试的套件，扩展必须确保所有测试需要的依赖关
    系都被自动处理好。如果测试由 ``python setup.py test`` 调用，测试的依赖关系
    由 `setup.py` 文件指定。测试套件也必须是发行版的一部分。
3.  通过审核的扩展的 API 可以通过下面特性的检查:
    - 一个通过审核的扩展必须支持在同一个 Python 进程中支持多个应用
    - 必须支持使用工厂模式创建应用
4.  必须以 BSD/MIT/WTFPL 许可
5.  官方扩展的命名模式是 *Flask-ExtensionName* 或 *ExtensionName-Flask*
6.  通过审核的扩展必须在 `setup.py` 文件里定义好它们的依赖关系，除非因
    其在 PyPI 上不可用而不能满足这个依赖。
7.  扩展的文档必须使用两种 Flask 的 Sphinx 文档主题中的一个
8.  setup.py 描述（因此PyPI 描述同）必须链接到文档、网站（如果有），
    并且必须有一个链接来自动安装开发版本（ ``PackageName==dev`` ）
9.  安装脚本中的 ``zip_safe`` 标志必须被设置为 ``False`` ，即使扩展对于
    压缩是安全的
10. 现行扩展必须支持 Python 2.6 以及 2.7


.. _ext-import-transition:

扩展导入的过渡
---------------------------

一段时间，我们推荐对 Flask 扩展使用命名空间包。这在实践中被证明是有问题
的，因为许多不同命名空间包系统存在竞争，并且 pip 会自动在不同的系统中切
换，这给用户导致了许多问题。

现在，我们推荐命名包为 ``flask_foo`` 替代过时的 ``flaskext.foo`` 。Flask
0.8 引入了重定向导入系统，允许从 ``flask.ext.foo`` 导入，并且如果
``flaskext.foo`` 失败时，会首先尝试 ``flask_foo`` 。

Flask 扩展应该力劝用户从 ``flask.ext.foo`` 导入，而不是 ``flask_foo``
或 ``flaskext_foo`` ，这样扩展可以迁移到新的包名称而不烦扰用户。


.. _OAuth 扩展: http://packages.python.org/Flask-OAuth/
.. _邮件列表: http://flask.pocoo.org/mailinglist/
.. _IRC 频道: http://flask.pocoo.org/community/irc/
