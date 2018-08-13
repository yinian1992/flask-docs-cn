.. _testing:

测试 Flask 应用
==========================

   **未经测试即不可靠。**

这一箴言的起源已经不可考了，而且也不是很正确，但距离真理已经不远了。如果没有为应用进
行过测试工作，那么要改善现有代码也将非常困难。而且一个不愿意给应用写测试的开发者，怕
是很容易就成为一名偏执狂。如果应用部署了自动化测试，代码的修改会立竿见影，让代码的修
改安全了许多。

Flask 把 Werkzeug 的测试类 :class:`~werkzeug.test.Client` 暴露出来用于应用的测
试，这个类用于处理上下文局部变量。你可以在你偏好的测试解决方案里使用它。

在

在本文档中使用 Python 自带的 `pytest`_ 包作为测试的基础框架。请用 ``pip`` 安装它::

    pip install pytest

.. _pytest:
   https://pytest.org

.. _application:

应用
---------------

首先，要有一个应用来测试；这里选用 :ref:`tutorial` 里的应用。如果你手头没有这个应用，
可以在 :gh:`示例代码 <examples/tutorial>` 处获取源码。

.. _the-testing-skeleton:

搭建测试骨架
--------------------

我们从应用根目录下开始添加测试代码，创建一个 Python 文件（:file:`test_flaskr.py`）
用于放置测试代码。当我们把文件命名为 ``test_*.py`` 这种格式时，Pytest 会自动检测到
这些文件。

接下来，我们创建一个名为 :func:`client` 的 `Pytest 固定函数 <pytest fixture>`_，
用于配置应用以适于测试以及初始化数据库::

    import os
    import tempfile

    import pytest

    from flaskr import flaskr


    @pytest.fixture
    def client():
        db_fd, flaskr.app.config['DATABASE'] = tempfile.mkstemp()
        flaskr.app.config['TESTING'] = True
        client = flaskr.app.test_client()

        with flaskr.app.app_context():
            flaskr.init_db()

        yield client

        os.close(db_fd)
        os.unlink(flaskr.app.config['DATABASE'])

这个 ``client`` 固定函数会在涉及到它的每项测试中调用。它提供了一个应用对象的简单接
口，用于向应用发送请求。它也会追踪 Cookies。

在初始配置时，应激活 ``TESTING`` 标志位。这样会禁用捕获请求处理时的错误，向应用发送
测试请求时才能给出详细的错误报告。

因为 SQLite3 是基于文件系统的，也就可以用 :mod:`tempfile` 模块创建并初始化一个临时
的数据库。:func:`~tempfile.mkstemp` 会做两件事：返回一个底层的文件句柄和一个随机的
文件名，后者就是我们的数据库名。我们只需要暂存 `db_fd`，之后就可以用
:func:`os.close` 关闭文件。

固定函数在关闭文件后从文件系统中删除文件，这样就在测试完成后删除了数据库。

这时运行测试应该会得到如下的输出::

    $ pytest

    ================ test session starts ================
    rootdir: ./flask/examples/flaskr, inifile: setup.cfg
    collected 0 items

    =========== no tests ran in 0.07 seconds ============

尽管我们尚未进行实际的测试，但我们已经看到， ``flaskr`` 应用没有语法错误，否则在导入
时就会报错。

.. _the-first-test:

第一个测试
--------------

是时候开始测试应用的功能了。让我们来检查一下，在访问应用的根路径（``/``）时是否会返回
“No entries here so far”。为此，我们在 :file:`test_flaskr.py` 添加了一个新的测试
函数，如下::

    def test_empty_db(client):
        """Start with a blank database."""

        rv = client.get('/')
        assert b'No entries here so far' in rv.data

你会注意到，我们的测试函数名是以 `test` 开头的；这让 `pytest`_ 自动识别测试函数并运
行。

我们可以用 ``client.get`` 向应用上的指定路径发送一个 HTTP `GET` 请求。返回值会是一
个 :class:`~flask.Flask.response_class` 对象。之后，我们可以通过访问
:attr:`~werkzeug.wrappers.BaseResponse.data` 属性来检查应用返回的值（字符串形
式）。如此，我们可以确保输出中包含 ``'No entries here so far'``。

再次运行，你应该看到通过了一项测试::

    $ pytest -v

    ================ test session starts ================
    rootdir: ./flask/examples/flaskr, inifile: setup.cfg
    collected 1 items

    tests/test_flaskr.py::test_empty_db PASSED

    ============= 1 passed in 0.10 seconds ==============

.. _logging-in-and-out:

登入与登出
------------------

我们应用的大部分功能只允许管理员访问，所以我们需要实现测试客户端的登入和登出。为此，我
们向登入和登出页面发送包含必需表单数据（用户名和密码）的请求。并且，因为登入和登出页面
会产生重定向，我们需要设置客户端 `follow_redirects`。

把下面的两个函数加入到  :file:`test_flaskr.py` 中::

    def login(client, username, password):
        return client.post('/login', data=dict(
            username=username,
            password=password
        ), follow_redirects=True)


    def logout(client):
        return client.get('/logout', follow_redirects=True)

现在我们可以添加下面这个新的测试函数，来测试登入和登出功能是否正常运转，并在接收到无效
认证信息会报错::

    def test_login_logout(client):
        """Make sure login and logout works."""

        rv = login(client, flaskr.app.config['USERNAME'], flaskr.app.config['PASSWORD'])
        assert b'You were logged in' in rv.data

        rv = logout(client)
        assert b'You were logged out' in rv.data

        rv = login(client, flaskr.app.config['USERNAME'] + 'x', flaskr.app.config['PASSWORD'])
        assert b'Invalid username' in rv.data

        rv = login(client, flaskr.app.config['USERNAME'], flaskr.app.config['PASSWORD'] + 'x')
        assert b'Invalid password' in rv.data

.. _test-adding-messages:

测试添加消息
--------------------

我们也应该测试消息的添加是否奏效。添加这样一个测试函数::

    def test_messages(client):
        """Test that messages work."""

        login(client, flaskr.app.config['USERNAME'], flaskr.app.config['PASSWORD'])
        rv = client.post('/add', data=dict(
            title='<Hello>',
            text='<strong>HTML</strong> allowed here'
        ), follow_redirects=True)
        assert b'No entries here so far' not in rv.data
        assert b'&lt;Hello&gt;' in rv.data
        assert b'<strong>HTML</strong> allowed here' in rv.data

这里我们检查的预期行为是在文本启用了 HTML，而在标题中禁用。

现在运行，会显示三个项目通过测试::

    $ pytest -v

    ================ test session starts ================
    rootdir: ./flask/examples/flaskr, inifile: setup.cfg
    collected 3 items

    tests/test_flaskr.py::test_empty_db PASSED
    tests/test_flaskr.py::test_login_logout PASSED
    tests/test_flaskr.py::test_messages PASSED

    ============= 3 passed in 0.23 seconds ==============

.. _other-testing-tricks:

其他测试技巧
--------------------

除了上文中使用测试客户端完成测试之外，还可以用
:meth:`~flask.Flask.test_request_context` 方法配合 `with` 语句激活一个临时的请求
上下文。然后你就可以像在视图函数中一样访问到 :class:`~flask.request`、
:class:`~flask.g` 和 :class:`~flask.session` 对象。这里给出了一个用到了这个方法的
完整示例::

    import flask

    app = flask.Flask(__name__)

    with app.test_request_context('/?name=Peter'):
        assert flask.request.path == '/'
        assert flask.request.args['name'] == 'Peter'

所有其他的与请求上下文绑定的对象都可以使用这个方法访问。

如果您希望测试应用在不同配置的情况下的表现，这种方法就不太好了，你可以考虑使用应用工厂
函数（参考 :ref:`app-factories`）。

注意，尽管你使用了一个测试用的请求上下文，:meth:`~flask.Flask.before_request` 以及
:meth:`~flask.Flask.after_request` 都不会被自动调用。不过，在测试请求上下文的
``with`` 块级语句结束时确实会调用 :meth:`~flask.Flask.teardown_request` 函数。
如果你仍要执行 :meth:`~flask.Flask.before_request` 函数，你需要手动调用
:meth:`~flask.Flask.preprocess_request`::

    app = flask.Flask(__name__)

    with app.test_request_context('/?name=Peter'):
        app.preprocess_request()
        ...

打开数据库连接或其他类似的操作都需要这个步骤，取决于应用是如何设计的。

如果你想要 :meth:`~flask.Flask.after_request` 函数被调用，那么需要手动调用
:meth:`~flask.Flask.process_response`，只是需要传入一个请求对象::

    app = flask.Flask(__name__)

    with app.test_request_context('/?name=Peter'):
        resp = Response('...')
        resp = app.process_response(resp)
        ...

通常这样做没什么大用，因为处理这种情况你可以直接采用测试客户端。

.. _faking-resources:

伪造资源与上下文
----------------------------

.. versionadded:: 0.10

通常，我们会在 :attr:`flask.g` 对象上存储用户认证信息和数据库连接。一般的模式会是在
第一次使用对象时，把对象放在应用上下文或 :attr:`flask.g` 上面，然后在上下文或全局对
象销毁时删除数据。试想一下怎么写获取当前用户的代码::

    def get_user():
        user = getattr(g, 'user', None)
        if user is None:
            user = fetch_current_user_from_database()
            g.user = user
        return user

对于测试，不修改代码就能从外部覆盖用户是很方便的。这个工作可以利用
:data:`flask.appcontext_pushed` 信号轻松完成::

    from contextlib import contextmanager
    from flask import appcontext_pushed, g

    @contextmanager
    def user_set(app, user):
        def handler(sender, **kwargs):
            g.user = user
        with appcontext_pushed.connected_to(handler, app):
            yield

然后这样使用信号::

    from flask import json, jsonify

    @app.route('/users/me')
    def users_me():
        return jsonify(username=g.user.username)

    with user_set(app, my_user):
        with app.test_client() as c:
            resp = c.get('/users/me')
            data = json.loads(resp.data)
            self.assert_equal(data['username'], my_user.username)

.. _keeping-the-context-around:

保持上下文
--------------------------

.. versionadded:: 0.4

有的时候回需要在发送一个常规请求后，继续保持请求上下文可访问，这样才可以进一步的内省。
在 Flask 0.4 中，用 :meth:`~flask.Flask.test_client` 配合 `with` 块级语句即可实
现::

    app = flask.Flask(__name__)

    with app.test_client() as c:
        rv = c.get('/?tequila=42')
        assert request.args['tequila'] == '42'

如果你仅仅使用 :meth:`~flask.Flask.test_client` 方法，而没有配合 `with` 块级语句，
那么 `assert` 断言会失败，因为这时 `request` 已经不存在了（相当于在请求的生命周期
以外访问请求上下文）。

.. _accessing-and-modifying-sessions:

获取和修改会话
--------------------------------

.. versionadded:: 0.8

有时你会需要在测试客户端中访问、修改会话。通常有两种方法来实现。如果你只是想确保会话对
象上有特定的键值，那么你只需要保持上下文，然后直接访问 :data:`flask.session`::

    with app.test_client() as c:
        rv = c.get('/')
        assert flask.session['foo'] == 42

不过这样并不能在请求发起前访问、修改会话。从 Flask 0.8 开始，我们提供了一个叫做“会
话事务”的机制，以在测试客户端的上下文中模拟开启会话的调用，然后就可以修改会话。在会话
事务结束后，会话上的修改将被保存。这个机制与使用哪个会话后端无关::

    with app.test_client() as c:
        with c.session_transaction() as sess:
            sess['a_key'] = 'a value'

        # once this is reached the session was stored

注意此时你应该操作 ``sess``，而不是 :data:`flask.session` 对象代理。这个
``sess`` 对象本身提供了与 :data:`flask.session` 相同的接口。

.. _testing-json-apis:

测试 JSON API
-----------------

.. versionadded:: 1.0

Flask 完美支持 JSON，也因此成为了构建 JSON API 的流行选择。在 Flask 中发送承载
JSON 数据的请求以及测试响应中的 JSON 数据非常方便::

    from flask import request, jsonify

    @app.route('/api/auth')
    def auth():
        json_data = request.get_json()
        email = json_data['email']
        password = json_data['password']
        return jsonify(token=generate_token(email, password))

    with app.test_client() as c:
        rv = c.post('/api/auth', json={
            'username': 'flask', 'password': 'secret'
        })
        json_data = rv.get_json()
        assert verify_token(email, json_data['token'])

向测试客户端的方法传递 ``json`` 参数，客户端会把请求数据进行 JSON 序列化，然后把
``Content-Type`` 标头设置为 ``application/json``。你可以用 ``get_json`` 方法来从
请求或是响应中提取 JSON 数据。

.. _testing-cli:

测试 CLI 命令
--------------------

Click 自带了 `测试命令的工具 <utilities for testing>`_ 。
:class:`~click.testing.CliRunner` 可以独立运行命令，并把结果捕获到
:class:`~click.testing.Result` 对象中。

Flask 提供了一个创建 :class:`~flask.testing.FlaskCliRunner`
的 :meth:`~flask.Flask.test_cli_runner` 方法，它可以自动把 Flask 应用对象传递
给 CLI。同样，用 :meth:`~flask.testing.FlaskCliRunner.invoke` 方法可以调用 CLI
中的命令::

    import click

    @app.cli.command('hello')
    @click.option('--name', default='World')
    def hello_command(name)
        click.echo(f'Hello, {name}!')

    def test_hello():
        runner = app.test_cli_runner()

        # invoke the command directly
        result = runner.invoke(hello_command, ['--name', 'Flask'])
        assert 'Hello, Flask' in result.output

        # or by name
        result = runner.invoke(args=['hello'])
        assert 'World' in result.output

在上面的例子中，按名称调用命令同时也检测了命令是否被正确注册到应用对象上。

如果要测试命令行参数但不实际运行命令，可以用
:meth:`~click.BaseCommand.make_context` 方法。
这在测试复杂匹配规则和自定义类型时相当有用::

    def upper(ctx, param, value):
        if value is not None:
            return value.upper()

    @app.cli.command('hello')
    @click.option('--name', default='World', callback=upper)
    def hello_command(name)
        click.echo(f'Hello, {name}!')

    def test_hello_params():
        context = hello_command.make_context('hello', ['--name', 'flask'])
        assert context.params['name'] == 'FLASK'

.. _click: http://click.pocoo.org/
.. _utilities for testing: http://click.pocoo.org/testing
