.. _testing:

测试 Flask 应用
==========================

   **没有经过测试的东西都是不完整的**

这一箴言的起源已经不可考了，尽管他不是完全正确的，但是仍然离真理
不远。没有测试过的应用将会使得提高现有代码质量很困难，二不测试应用
程序的开发者，会显得特别多疑。如果一个应用拥有自动生成的测试，那么
您就可以安全的修改然后立刻知道是否有错误。

Flask 提供了一种方法用于测试您的应用，那就是将 Werkzeug 测试 
:class:`~werkzeug.test.Client` 暴露出来，并且为您操作这些内容
的本地上下文变量。然后您就可以将自己最喜欢的测试解决方案应用于其上了。
在这片文档中，我们将会使用Python自带的 :mod:`unittest` 包。

应用程序
---------------

首先，我们需要一个应用来测试，我们将会使用 :ref:`tutorial` 这里的应用
来演示。如果您还没有获取它，请从 `the examples` 这里查找源码。

.. _例子:
   http://github.com/mitsuhiko/flask/tree/master/examples/flaskr/

测试的大框架
--------------------

为了测试这个引用，我们添加了第二个模块(`flaskr_tests.py`)，
并且创建了一个框架如下::

    import os
    import flaskr
    import unittest
    import tempfile

    class FlaskrTestCase(unittest.TestCase):

        def setUp(self):
            self.db_fd, flaskr.app.config['DATABASE'] = tempfile.mkstemp()
            flaskr.app.config['TESTING'] = True
            self.app = flaskr.app.test_client()
            flaskr.init_db()

        def tearDown(self):
            os.close(self.db_fd)
            os.unlink(flaskr.app.config['DATABASE'])

    if __name__ == '__main__':
        unittest.main()


在 :meth:`~unittest.TestCase.setUp` 方法的代码创建了一个新的测试
客户端并且初始化了一个新的数据库。这个函数将会在每次独立的测试函数
运行之前运行。要在测试之后删除这个数据库，我们在 :meth: `~unittest.TestCase.tearDown`
函数当中关闭这个文件，并将它从文件系统中删除。同时，在初始化的时候
``TESTING`` 配置标志被激活，这将会使得处理请求时的错误捕捉失效，以便于
您在进行对应用发出请求的测试时获得更好的错误反馈。

这个测试客户端将会给我们一个通向应用的简单接口，我们可以激发对
对向应用发送请求的测试，并且此客户端也会帮我们记录 Cookie 的
动态。

因为 SQLite3 是基于文件系统的，我们可以很容易的使用临时文件模块来
创建一个临时的数据库并初始化它，函数 :func:`~tempfile.mkstemp` 
实际上完成了两件事情：他反悔了一个底层的文件指针以及一个随机
的文件名，后者我们用作数据库的名字。我们只需要将 `db_fd` 变量
保存起来，就可以使用 `os.close` 方法来关闭这个文件。

如果我们运行这套测试，我们应该会得到如下的输出::

    $ python flaskr_tests.py

    ----------------------------------------------------------------------
    Ran 0 tests in 0.000s

    OK

虽然现在还未进行任何实际的测试，我们已经可以知道我们的 flaskr 
程序没有语法错误了。否则，在 import 的时候就会抛出一个致死的
错误了。

第一个测试
--------------

是进行第一个应用功能的测试的时候了。让我们检查当我们访问
根路径(``/``)时应用程序是否正确的返回了了“No entries here so far”
字样。为此，我们添加了一个新的测试函数到我们的类当中，
如下面的代码所示::

    class FlaskrTestCase(unittest.TestCase):

        def setUp(self):
            self.db_fd, flaskr.app.config['DATABASE'] = tempfile.mkstemp()
            self.app = flaskr.app.test_client()
            flaskr.init_db()

        def tearDown(self):
            os.close(self.db_fd)
            os.unlink(flaskr.DATABASE)

        def test_empty_db(self):
            rv = self.app.get('/')
            assert 'No entries here so far' in rv.data

注意到我们的测试函数以 `test` 开头，这允许 :mod:`unittest` 模块自动
识别出哪些方法是一个测试方法，并且运行它。

通过使用 `self.app.get` 我们可以发送一个 HTTP `GET` 请求给应用的
某个给定路径。返回值将会是一个 :class:`~flask.Flask.response_class`
对象。我们可以使用 :attr:`~werkzeug.wrappers.BaseResponse.data` 属性
来检查程序的返回值(以字符串类型)。在这里，我们检查 ``'No entries here so far'``
是不是输出的输出内容的一部分。

再次运行，您应该看到一个测试成功通过了::

    $ python flaskr_tests.py
    .
    ----------------------------------------------------------------------
    Ran 1 test in 0.034s

    OK

登陆和登出
------------------

我们应用的大部分功能只允许具有管理员资格的用户访问。所以我们需要
一种方法来帮助我们的测试客户端登陆和登出。为此，我们向登陆和登出
页面发送一些请求，这些请求都携带了表单数据（用户名和密码），因为
登陆和登出页面都会重定向，我们将客户端设置为 `follow_redirects` 。

将如下里那个歌方法加入到您的 `FlaskrTestCase` 类::

   def login(self, username, password):
       return self.app.post('/login', data=dict(
           username=username,
           password=password
       ), follow_redirects=True)

   def logout(self):
       return self.app.get('/logout', follow_redirects=True)

现在我们可以轻松的测试登陆和登出是正常工作还是因认证失败而出错，
添加新的测试函数到类中::

   def test_login_logout(self):
       rv = self.login('admin', 'default')
       assert 'You were logged in' in rv.data
       rv = self.logout()
       assert 'You were logged out' in rv.data
       rv = self.login('adminx', 'default')
       assert 'Invalid username' in rv.data
       rv = self.login('admin', 'defaultx')
       assert 'Invalid password' in rv.data

测试消息的添加
--------------------

我们同时应该测试消息的添加功能是否正常，添加一个新的
测试方法如下::

    def test_messages(self):
        self.login('admin', 'default')
        rv = self.app.post('/add', data=dict(
            title='<Hello>',
            text='<strong>HTML</strong> allowed here'
        ), follow_redirects=True)
        assert 'No entries here so far' not in rv.data
        assert '&lt;Hello&gt;' in rv.data
        assert '<strong>HTML</strong> allowed here' in rv.data

这里我们测试计划的行为是否能够正常工作，即在正文中可以出现 HTML 
标签，而在标题中不允许。

运行这个测试，我们应该得到三个通过的测试::

    $ python flaskr_tests.py
    ...
    ----------------------------------------------------------------------
    Ran 3 tests in 0.332s

    OK

关于请求的头信息和状态值等更复杂的测试，请参考
`MiniTwit Example`_ ，在这个例子的源代码里包含
一套更长的测试。

.. _MiniTwit Example:
   http://github.com/mitsuhiko/flask/tree/master/examples/minitwit/


其他测试技巧
--------------------

除了如上文演示的使用测试客户端完成测试的方法，也有一个
:meth:`~flask.Flask.test_request_context` 方法可以用于
配合 `with` 声明，用于于激活一个临时的请求上下文。通过
它，您可以访问 :class:`~flask.request` 、:class:`~flask.g` 
和 :class:`~flask.session` 类的对象，就像在视图中一样。
这里有一个完整的例子示范了这种用法::

    app = flask.Flask(__name__)

    with app.test_request_context('/?name=Peter'):
        assert flask.request.path == '/'
        assert flask.request.args['name'] == 'Peter'

所有其他的访问受限的对象都可以使用同样的方法访问。

如果您希望测试应用在不同配置的情况下的表现，这里似乎没有一个
很好的方法，考虑使用应用的工厂函数(参考 :ref:`app-factories`)

注意，尽管你在使用一个测试用的请求环境，函数
:meth:`~flask.Flask.before_request` 以及它的兄弟
:meth:`~flask.Flask.after_request` 都不会自动运行。
然而，:meth:`~flask.Flask.teardown_request` 函数在
测试请求的上下文离开 `with` 块之确实会执行。如果您
希望 :meth:`~flask.Flask.before_request` 函数仍然执行。
您需要手动调用 :meth:`~flask.Flask.preprocess_request` 方法::

    app = flask.Flask(__name__)

    with app.test_request_context('/?name=Peter'):
        app.preprocess_request()
        ...

这对于打开数据库连接或者其他类似的操作来说，很可能
是必须的，这视您应用的设计方式而定。

如果您希望调用 :meth:`~flask.Flask.after_request` 函数，
您需要使用 :meth:`~flask.Flask.process_response` 方法。
这个方法需要您传入一个 response 对象::

    app = flask.Flask(__name__)

    with app.test_request_context('/?name=Peter'):
        resp = Response('...')
        resp = app.process_response(resp)
        ...

这通常不是很有效，因为这时您可以直接转向使用
测试客户端。


保存上下文
--------------------------

.. versionadded:: 0.4

有时，激发一个通常的请求，但是将保存当前的上下文
保存更长的时间，以便于附加的内省发生是很有用的。
在 Flask 0.4 中，通过 :meth:`~flask.Flask.test_client`
函数和 `with` 块的使用可以实现::

    app = flask.Flask(__name__)

    with app.test_client() as c:
        rv = c.get('/?tequila=42')
        assert request.args['tequila'] == '42'

如果您仅仅使用 :meth:`~flask.Flask.test_client` 方法，而
不使用 `with` 代码块， `assert` 断言会失败，因为 `request`
不再可访问(因为您试图在非真正请求中时候访问它)。然而，请
记住任何 :meth:`~flask.Flask.after_request` 函数此时都已经
被执行了，所以您的数据库和一切相关的东西都可能已经被关闭。


访问和修改 Sessions
--------------------------------

.. versionadded:: 0.8

有时，在测试客户端里访问和修改 Sesstions 可能会非常有用。
通常有两种方法实现这种需求。如果您仅仅希望确保一个 Session 
拥有某个特定的键，且此键的值是某个特定的值，那么您可以只
保存起上下文，并且访问 :data:`flask.session`::

    with app.test_client() as c:
        rv = c.get('/')
        assert flask.session['foo'] == 42

但是这样做并不能是您修改 Session 或在请求发出之前访问 Session。
从 Flask 0.8 开始，我们提供一个叫做 “Session 事务” 的东西用于
模拟适当的调用，从而在测试客户端的上下文中打开一个 Session，并
用于修改。在事务的结尾，Session 将被恢复为原来的样子。这些都
独立于 Session 的后端使用::


    with app.test_client() as c:
        with c.session_transaction() as sess:
            sess['a_key'] = 'a value'

        # once this is reached the session was stored

注意到，在此时，您必须使用这个 ``sess`` 对象而不是调用
:data:`flask.session` 代理，而这个对象本身提供了同样的接口。
