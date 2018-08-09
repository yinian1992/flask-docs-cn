.. currentmodule:: flask

.. _test-coverage:

测试覆盖
=============

为应用编写单元测试可以让你检查代码是否像预期一样正常工作。Flask 提供了一个测试客户端，
它可以模拟传入到应用的请求并返回响应数据。

你应该尽可能测试你的代码。函数中的代码只在函数被调用时才会涉及，而比如 ``if`` 块这种
分支中的代码，只在条件满足时才会运行。你会需要确保测试覆盖到了每个函数、每个分支。

覆盖率越接近 100%，你越不会遇到一处修改而动全身的情况。尽管如此，100% 的覆盖率并不能
保证你的应用没有 Bug。特别是它并不能测试浏览器中的用户交互。即便是这样，测试覆盖仍是
开发中的一项利器。

.. note::
    此教程中这部分内容安排较为靠后，但在你未来的实际项目中，测试应该与开发并行。

这里会用到 `pytest`_ 和 `coverage`_ 来测试评估代码。

安装这两个包:

.. code-block:: none

    pip install pytest coverage

.. _pytest: https://pytest.readthedocs.io/
.. _coverage: https://coverage.readthedocs.io/

.. _setup-and-fixtures:

设置与固定函数
------------------

测试代码应位于 ``tests`` 目录。这个目录与 ``flaskr`` 包目录相邻，而不是在包目录里
面。 ``tests/conftest.py`` 文件包含了也被称作 *固定函数* （Pytest 中的 Fixture）的
设置函数，在每个测试中都会用到。包含测试的 Python 模块名应以 ``test_`` 开头，模块里
的函数也应该以 ``test_`` 开头。

每个测试都会创建一个新的临时数据库文件，并填入一些测试中会用到的数据。下面编写插入这些
数据的 SQL。

.. code-block:: sql
    :caption: ``tests/data.sql``

    INSERT INTO user (username, password)
    VALUES
      ('test', 'pbkdf2:sha256:50000$TCI4GzcX$0de171a4f4dac32e3364c7ddc7c14f3e2fa61f2d17574483f7ffbb431b4acb2f'),
      ('other', 'pbkdf2:sha256:50000$kJPKsz6N$d2d4784f1b030a9761f5ccaeeaca413f27f2ecb76d6168407af962ddce849f79');

    INSERT INTO post (title, body, author_id, created)
    VALUES
      ('test title', 'test' || x'0a' || 'body', 1, '2018-01-01 00:00:00');

``app`` 固定函数调用应用工厂，然后为应用配置测试标志位和和数据库，而不是使用你本地的
开发配置。

.. code-block:: python
    :caption: ``tests/conftest.py``

    import os
    import tempfile

    import pytest
    from flaskr import create_app
    from flaskr.db import get_db, init_db

    with open(os.path.join(os.path.dirname(__file__), 'data.sql'), 'rb') as f:
        _data_sql = f.read().decode('utf8')


    @pytest.fixture
    def app():
        db_fd, db_path = tempfile.mkstemp()

        app = create_app({
            'TESTING': True,
            'DATABASE': db_path,
        })

        with app.app_context():
            init_db()
            get_db().executescript(_data_sql)

        yield app

        os.close(db_fd)
        os.unlink(db_path)


    @pytest.fixture
    def client(app):
        return app.test_client()


    @pytest.fixture
    def runner(app):
        return app.test_cli_runner()

:func:`tempfile.mkstemp` 创建并打开一个临时文件，返回文件对象和路径。 ``DATABASE``
路径将被覆盖为这个临时的路径，而不是应用实例的文件夹中。在设置好这个路径后，创建数据库
表并插入测试数据。在测试完成后，临时文件将在关闭后被删除。

:data:`TESTING` 让 Flask 把应用设置为测试模式。Flask 会调整内部行为使其更适合测试。
其他扩展也可以使用这个标志位让测试更加简单。

``client`` 固定函数调用了由 ``app`` 固定函数创建的应用对象上的
:meth:`app.test_client() <Flask.test_client>` 。测试之后会用这个客户端来向应用发
送请求而不是真的运行服务器。

``runner`` 固定函数与 ``client`` 类似。
:meth:`app.test_cli_runner() <Flask.test_cli_runner>` 创建一个运行器，调用应用上
注册的 Click 命令。

Pytest 用通过函数名和测试函数的参数来匹配固定函数。例如，你之后要编写的
``test_hello`` 函数接受一个 ``client`` 参数。Pytest 匹配并调用 ``client`` 固定函
数，把返回值作为这个参数传递给测试函数。

.. _factory:

应用工厂
---------

对于应用工厂本身并没有什么值得测试的。各项测试已经执行了大部分代码，所以如果应用工厂
出了问题，在其他的测试中也会体现出来。

唯一可能出现异常的地方就是配置测试标记位。如果没有成功配置，会使用默认值，否则配置会被
正常覆盖。

.. code-block:: python
    :caption: ``tests/test_factory.py``

    from flaskr import create_app


    def test_config():
        assert not create_app().testing
        assert create_app({'TESTING': True}).testing


    def test_hello(client):
        response = client.get('/hello')
        assert response.data == b'Hello, World!'

在本教程开始部分的例子中，就已经在应用工厂里配置好了 ``hello`` 的路由。这个视图返回
“Hello, World!”，这里测试响应数据是否符合预期。

.. _database:

数据库
--------

在同一个应用上下文中，每次调用 ``get_db`` 应该返回相同的数据库连接。而在应用上下文销
毁时，数据库连接应该被关闭。

.. code-block:: python
    :caption: ``tests/test_db.py``

    import sqlite3

    import pytest
    from flaskr.db import get_db


    def test_get_close_db(app):
        with app.app_context():
            db = get_db()
            assert db is get_db()

        with pytest.raises(sqlite3.ProgrammingError) as e:
            db.execute('SELECT 1')

        assert 'closed' in str(e)

``init-db`` 命令调用 ``init_db`` 函数，并输出初始化信息。

.. code-block:: python
    :caption: ``tests/test_db.py``

    def test_init_db_command(runner, monkeypatch):
        class Recorder(object):
            called = False

        def fake_init_db():
            Recorder.called = True

        monkeypatch.setattr('flaskr.db.init_db', fake_init_db)
        result = runner.invoke(args=['init-db'])
        assert 'Initialized' in result.output
        assert Recorder.called

这项测试用到了 Pytest 的 ``monkeypatch`` 固定函数，把 ``init_db`` 替换成了一个
调用记录的函数。之前写好的 ``runner`` 固定函数在这里用于调用 ``init-db`` 命令。

.. _authentication:

认证
--------------

对大多数视图而言，用户需要登入后才能访问。测试这个行为很简单，只需要用客户端向
``login`` 视图发送一个 ``POST`` 请求。为了避免重复工作，这里把这些行为实现为类的方
法，然后用固定函数为各项测试传递作为参数的客户端。

.. code-block:: python
    :caption: ``tests/conftest.py``

    class AuthActions(object):
        def __init__(self, client):
            self._client = client

        def login(self, username='test', password='test'):
            return self._client.post(
                '/auth/login',
                data={'username': username, 'password': password}
            )

        def logout(self):
            return self._client.get('/auth/logout')


    @pytest.fixture
    def auth(client):
        return AuthActions(client)

有了 ``auth`` 固定函数之后，你可以在测试中调用 ``auth.login()`` 来登入为 ``test``
用户，这个用户早在 ``app`` 固定函数中，就作为测试数据的一部分插入到数据库中了。

``register`` 注册视图应该在接收到 ``GET`` 方法的请求时成功渲染模板。而在接收到
``POST`` 方法的请求时验证表单数据，重定向到登入页面，把用户数据插入到数据库中。对于
无效数据则显示错误页面。

.. code-block:: python
    :caption: ``tests/test_auth.py``

    import pytest
    from flask import g, session
    from flaskr.db import get_db


    def test_register(client, app):
        assert client.get('/auth/register').status_code == 200
        response = client.post(
            '/auth/register', data={'username': 'a', 'password': 'a'}
        )
        assert 'http://localhost/auth/login' == response.headers['Location']

        with app.app_context():
            assert get_db().execute(
                "select * from user where username = 'a'",
            ).fetchone() is not None


    @pytest.mark.parametrize(('username', 'password', 'message'), (
        ('', '', b'Username is required.'),
        ('a', '', b'Password is required.'),
        ('test', 'test', b'already registered'),
    ))
    def test_register_validate_input(client, username, password, message):
        response = client.post(
            '/auth/register',
            data={'username': username, 'password': password}
        )
        assert message in response.data

:meth:`client.get() <werkzeug.test.Client.get>` 发送一个 ``GET`` 请求并返回
Flask 返回的 :class:`Response` 对象。同样地，
:meth:`client.post() <werkzeug.test.Client.post>` 发送一个 ``POST`` 请求，并把
``data`` 字典转换成表单数据。

要测试页面是否渲染成功，只需提交请求，然后检查 :attr:`~Response.status_code` 是否
为 ``200 OK`` 。渲染失败时，Flask 会返回 ``500 Internal Server Error`` 。

当注册页面重定向到登入界面时， :attr:`~Response.headers` 中的 ``Location`` 标头值
将会是登入视图的 URL。

:attr:`~Response.data` 包含了 Bytes 形式的响应内容。如果要特定值被渲染到页面中，可
以在 ``data`` 中检查。Bytes 只能与 Bytes 相比较。如果要与 Unicode 文本进行比较，
则需要调用
:meth:`get_data(as_text=True) <werkzeug.wrappers.BaseResponse.get_data>` 。

``pytest.mark.parametrize`` 让 Pytest 以不同的参数运行测试函数，这里我们用它来测试
不同的无效输入和报错信息，而不是把同样的代码复写三遍。

``login`` 视图的测试与 ``register`` 的非常相近。在用户登入后， :data:`session` 应
已经设置好 ``user_id`` ，而不是同数据库中的数据相比较。

.. code-block:: python
    :caption: ``tests/test_auth.py``

    def test_login(client, auth):
        assert client.get('/auth/login').status_code == 200
        response = auth.login()
        assert response.headers['Location'] == 'http://localhost/'

        with client:
            client.get('/')
            assert session['user_id'] == 1
            assert g.user['username'] == 'test'


    @pytest.mark.parametrize(('username', 'password', 'message'), (
        ('a', 'test', b'Incorrect username.'),
        ('test', 'a', b'Incorrect password.'),
    ))
    def test_login_validate_input(auth, username, password, message):
        response = auth.login(username, password)
        assert message in response.data

返回响应后，在 ``with`` 块中使用 ``client`` 使得访问 :data:`session` 这样的上下
文变量成为可能。正常情况下，在请求的生命周期以外访问 ``session`` 会报错。

``logout`` 的测试工作与 ``login`` 正相反。用户登出后， :data:`session` 中不应含有
``user_id`` 。

.. code-block:: python
    :caption: ``tests/test_auth.py``

    def test_logout(client, auth):
        auth.login()

        with client:
            auth.logout()
            assert 'user_id' not in session

.. _blog:

博客
-----

所有的博客视图测试都应该用到之前写过的 ``auth`` 固定函数。调用 ``auth.login()`` 之
后，从客户端发出的请求都将登入为 ``test`` 用户，

``index`` 视图应该显示之前作为测试数据插入的文章信息。当以作者身份登入时，还应该显示
编辑文章的链接。

在测试 ``index`` 视图时，你也可以测试更多的与认证相关的行为。未登入时，每页中都应该
显示登入和注册的链接。登入后则显示登出链接。

.. code-block:: python
    :caption: ``tests/test_blog.py``

    import pytest
    from flaskr.db import get_db


    def test_index(client, auth):
        response = client.get('/')
        assert b"Log In" in response.data
        assert b"Register" in response.data

        auth.login()
        response = client.get('/')
        assert b'Log Out' in response.data
        assert b'test title' in response.data
        assert b'by test on 2018-01-01' in response.data
        assert b'test\nbody' in response.data
        assert b'href="/1/update"' in response.data

``create``、 ``update`` 和 ``delete`` 必须登入才能访问。登入用户必须是文章的作者才
能访问 ``update`` 和 ``delete`` ，如果不是则返回 ``403 Forbidden`` 。如果给定
``id`` 的文章不存在， ``update`` 和 ``delete`` 应该返回 ``404 Not Found`` 。

.. code-block:: python
    :caption: ``tests/test_blog.py``

    @pytest.mark.parametrize('path', (
        '/create',
        '/1/update',
        '/1/delete',
    ))
    def test_login_required(client, path):
        response = client.post(path)
        assert response.headers['Location'] == 'http://localhost/auth/login'


    def test_author_required(app, client, auth):
        # change the post author to another user
        with app.app_context():
            db = get_db()
            db.execute('UPDATE post SET author_id = 2 WHERE id = 1')
            db.commit()

        auth.login()
        # current user can't modify other user's post
        assert client.post('/1/update').status_code == 403
        assert client.post('/1/delete').status_code == 403
        # current user doesn't see edit link
        assert b'href="/1/update"' not in client.get('/').data


    @pytest.mark.parametrize('path', (
        '/2/update',
        '/2/delete',
    ))
    def test_exists_required(client, auth, path):
        auth.login()
        assert client.post(path).status_code == 404

对于 ``GET`` 请求， ``create`` 和 ``update`` 视图会渲染并返回 ``200 OK`` 。如果
``POST`` 请求发送的数据有效， ``create`` 会把新文章的数据插入到数据库中，
``update`` 视图则会修改现有数据。如果数据无效，这两个视图则会提示错误信息。

.. code-block:: python
    :caption: ``tests/test_blog.py``

    def test_create(client, auth, app):
        auth.login()
        assert client.get('/create').status_code == 200
        client.post('/create', data={'title': 'created', 'body': ''})

        with app.app_context():
            db = get_db()
            count = db.execute('SELECT COUNT(id) FROM post').fetchone()[0]
            assert count == 2


    def test_update(client, auth, app):
        auth.login()
        assert client.get('/1/update').status_code == 200
        client.post('/1/update', data={'title': 'updated', 'body': ''})

        with app.app_context():
            db = get_db()
            post = db.execute('SELECT * FROM post WHERE id = 1').fetchone()
            assert post['title'] == 'updated'


    @pytest.mark.parametrize('path', (
        '/create',
        '/1/update',
    ))
    def test_create_update_validate(client, auth, path):
        auth.login()
        response = client.post(path, data={'title': '', 'body': ''})
        assert b'Title is required.' in response.data

``delete`` 视图会重定向到索引页 URL，此时应已删除数据库中的相应文章。

.. code-block:: python
    :caption: ``tests/test_blog.py``

    def test_delete(client, auth, app):
        auth.login()
        response = client.post('/1/delete')
        assert response.headers['Location'] == 'http://localhost/'

        with app.app_context():
            db = get_db()
            post = db.execute('SELECT * FROM post WHERE id = 1').fetchone()
            assert post is None

.. _running-the-test:

运行测试
-----------------

这里做了一些额外的配置，虽然不是必须的，但可以让测试运行的输出不那么令人眼花。这些配
置应放置在项目的 ``setup.cfg`` 文件里。

.. code-block:: none
    :caption: ``setup.cfg``

    [tool:pytest]
    testpaths = tests

    [coverage:run]
    branch = True
    source =
        flaskr

用 ``pytest`` 命令来运行测试。这个命令会自动查找并运行你之前写好的测试函数。

.. code-block:: none

    pytest

    ========================= test session starts ==========================
    platform linux -- Python 3.6.4, pytest-3.5.0, py-1.5.3, pluggy-0.6.0
    rootdir: /home/user/Projects/flask-tutorial, inifile: setup.cfg
    collected 23 items

    tests/test_auth.py ........                                      [ 34%]
    tests/test_blog.py ............                                  [ 86%]
    tests/test_db.py ..                                              [ 95%]
    tests/test_factory.py ..                                         [100%]

    ====================== 24 passed in 0.64 seconds =======================

如果有任何测试未通过，Pytest 会显示测试抛出的异常。你可以用 ``pytest -v`` 查看具体
测试函数的列表，而不是上面那样以点代替。

用 ``coverage`` 命令运行 Pytest 可以测量测试的代码覆盖率。

.. code-block:: none

    coverage run -m pytest

你也可以在终端里阅览覆盖率简报：

.. code-block:: none

    coverage report

    Name                 Stmts   Miss Branch BrPart  Cover
    ------------------------------------------------------
    flaskr/__init__.py      21      0      2      0   100%
    flaskr/auth.py          54      0     22      0   100%
    flaskr/blog.py          54      0     16      0   100%
    flaskr/db.py            24      0      4      0   100%
    ------------------------------------------------------
    TOTAL                  153      0     44      0   100%

也可以用这个命令输出一份 HTML 报告，指明覆盖了哪些文件中的哪些行：

.. code-block:: none

    coverage html

这会生成一个里面有很多文件的 ``htmlcov`` 文件夹。在浏览器中打开
``htmlcov/index.html`` 即可查看报告。

继续阅读 :doc:`deploy` 部分。
