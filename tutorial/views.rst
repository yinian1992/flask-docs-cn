.. currentmodule:: flask

.. _blueprints-and-views:

蓝图与视图
============

视图函数是响应传入应用的请求的函数。Flask 用 URL 规则来匹配传入请求的 URL，并传递给
相应的处理请求的视图。视图返回的数据会被 Flask 转换成要传出的请求。Flask 也可以反方向
根据视图的函数和参数生成 URL。

.. _create-a-blueprint:

创建蓝图
-------------

:class:`Blueprint` 用于组织一系列关联的视图和其他代码。随后可以把他们注册到蓝图上，
而不是直接注册到应用上，然后在应用工厂函数中把蓝图注册到应用上。

Flaskr 将配备两个蓝图，一个用于认证函数，另一个用于博客文章相关函数。蓝图可以把代码以
模块的形式分割开来。博客程序是需要认证功能的，那么我们首先编写认证部分。

.. code-block:: python
    :caption: ``flaskr/auth.py``

    import functools

    from flask import (
        Blueprint, flash, g, redirect, render_template, request, session, url_for
    )
    from werkzeug.security import check_password_hash, generate_password_hash

    from flaskr.db import get_db

    bp = Blueprint('auth', __name__, url_prefix='/auth')

此处创建了一个名为 ``'auth'`` 的 :class:`Blueprint` 实例。如同应用对象，也需要告诉
蓝图其定义所在的位置，所以要把 ``__name__`` 作为第二个参数传递给蓝图。
``url_prefix`` 参数将作为所有这个蓝图关联的 URL 的前缀。

在工厂函数中用 :meth:`app.register_blueprint() <Flask.register_blueprint>` 导入
并注册蓝图。只是要把这行代码放在工厂函数的最后，但要在返回应用对象之前。

.. code-block:: python
    :caption: ``flaskr/__init__.py``

    def create_app():
        app = ...
        # existing code omitted

        from . import auth
        app.register_blueprint(auth.bp)

        return app

那么，认证蓝图还需要注册新用户、登入以及登出的视图。


.. _the-first-view-register:

第一个视图：注册
------------------------

当用户访问 ``/auth/register`` 这个 URL， ``register`` 视图会返回需要填写的表单的
`HTML`_ 。当用户提交表单，这个视图还会校验用户输入，校验成功则创建新用户并跳转到登入
界面，校验失败则继续显示表单，并提供错误信息。

.. _HTML: https://developer.mozilla.org/docs/Web/HTML

现在只需要编写视图代码。编写生成 HTML 表单的模板将在之后描述。

.. code-block:: python
    :caption: ``flaskr/auth.py``

    @bp.route('/register', methods=('GET', 'POST'))
    def register():
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            db = get_db()
            error = None

            if not username:
                error = 'Username is required.'
            elif not password:
                error = 'Password is required.'
            elif db.execute(
                'SELECT id FROM user WHERE username = ?', (username,)
            ).fetchone() is not None:
                error = 'User {} is already registered.'.format(username)

            if error is None:
                db.execute(
                    'INSERT INTO user (username, password) VALUES (?, ?)',
                    (username, generate_password_hash(password))
                )
                db.commit()
                return redirect(url_for('auth.login'))

            flash(error)

        return render_template('auth/register.html')

``register`` 视图函数做了这些工作：

#.  :meth:`@bp.route <Blueprint.route>` 把 URL ``/register`` 关联到
    ``register`` 视图函数上。当 Flask 接收到访问 ``/auth/register`` 的请求时，会
    调用 ``register`` 视图函数，并以返回值作为响应。

#.  当用户提交表单后， :attr:`request.method <Request.method>` 的值将是
    ``'POST'`` 。这种情况下，开始验证表单。


#.  :attr:`request.form <Request.form>` 是一个特殊类型的 :class:`dict` ，映射用
    户提交的表单键值对。此处用户输入的是 ``username`` 和 ``password`` 。

#.  验证 ``username`` 与 ``password`` 为非空。

#.  通过查询数据库，检查是否返回空值来验证 ``username`` 尚未注册。
    :meth:`db.execute <sqlite3.Connection.execute>` 方法接受带 ``?`` 占位符的
    SQL 查询，用元组中的用户输入值来代替占位符。数据库的支持库会小心转义这些值，使你
    免受 *SQL 注入攻击* 。

    :meth:`~sqlite3.Cursor.fetchone` 返回查询结果中的一行。如果查询没有返回结果，
    则返回 ``None`` 。之后用到的 :meth:`~sqlite3.Cursor.fetchall` 返回全部查询结
    果的列表。

#.  如果表单验证通过，则向数据库中插入新用户数据。安全起见，密码永远都不应该直接存放
    在数据库中。而是应该使用 :func:`~werkzeug.security.generate_password_hash`
    函数来 Hash 密码，然后存储密码的 Hash 值。因为这条查询修改了数据，需要调用
    :meth:`db.commit() <sqlite3.Connection.commit>` 来保存变更。

#.  在存储用户数据之后，将用户跳转到登入页面。 :func:`url_for` 基于视图名称生成登入
    视图的 URL。这使得你可以在之后直接更改视图的 URL 而不用在涉及此 URL 的所有代码中
    手动修改。 :func:`redirect` 生成跳转到刚才生成的 URL 的响应。

#.  如果表单验证失败，将会向用户展示错误信息。 :func:`flash` 存储的信息可以在模板
    时取回。

#.  当用户第一次访问到 ``auth/register`` 或是表单验证出错，会显示注册表单的 HTML 页
    面。 :func:`render_template` 渲染包含此 HTML 的模板，你将会在教程的后续部分编
    写这个模板。

.. _login:

登入
-------

这个视图与前面的 ``register`` 视图如出一辙。

.. code-block:: python
    :caption: ``flaskr/auth.py``

    @bp.route('/login', methods=('GET', 'POST'))
    def login():
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            db = get_db()
            error = None
            user = db.execute(
                'SELECT * FROM user WHERE username = ?', (username,)
            ).fetchone()

            if user is None:
                error = 'Incorrect username.'
            elif not check_password_hash(user['password'], password):
                error = 'Incorrect password.'

            if error is None:
                session.clear()
                session['user_id'] = user['id']
                return redirect(url_for('index'))

            flash(error)

        return render_template('auth/login.html')

这个视图与 ``register`` 视图的区别是：

#.  首先查询用户信息并存储到变量中以备后续使用。

#.  :func:`~werkzeug.security.check_password_hash` 把提交的密码采用与存储密码时
    相同的方法 Hash，然后比较 Hash 值。如果二者相同，则密码有效。

#.  :data:`session` 是一个跨请求存储数据的 :class:`dict` 。验证通过后，用户的
    ``id`` 将会存储到新会话中。数据会存储到发送给浏览器的 *Cookie* 中，而浏览器也会
    在后续请求中把 *Cookie* 发送回来。Flask 对数据做了 *签名* ，确保数据未被篡改。

现在，用户的 ``id`` 已经存储在 :data:`session` 中，在后续的请求中也可以访问到。在
每个请求开始时用户已经处于登入状态，那么用户信息也将在其他视图中可用。

.. code-block:: python
    :caption: ``flaskr/auth.py``

    @bp.before_app_request
    def load_logged_in_user():
        user_id = session.get('user_id')

        if user_id is None:
            g.user = None
        else:
            g.user = get_db().execute(
                'SELECT * FROM user WHERE id = ?', (user_id,)
            ).fetchone()

:meth:`bp.before_app_request() <Blueprint.before_app_request>` 注册在视图函数前
运行的函数，与 URL 无关。 ``load_logged_in_user`` 从 :data:`session` 中提取用户
ID，然后从数据库中查询用户数据，并存储到 :data:`g.user <g>` 上，这个对象的生命
周期与请求一样。如果 :data:`session` 中没有用户 ID，或者数据库中没有记录该用户 ID，
``g.user`` 则为空。

.. _logout:

登出
------

你需要移除 :data:`session` 中的用户 ID 来完成登出操作。这样
``load_logged_in_user`` 才不会在之后的请求中加载用户。

.. code-block:: python
    :caption: ``flaskr/auth.py``

    @bp.route('/logout')
    def logout():
        session.clear()
        return redirect(url_for('index'))

.. _require-authentication-in-other-views:

在其他视图中需要认证
-------------------------------------

用户在登入后才可以创建、编辑以及删除博客文章。这里为每个视图使用了 *装饰器* 来检查用
户是否登入。

.. code-block:: python
    :caption: ``flaskr/auth.py``

    def login_required(view):
        @functools.wraps(view)
        def wrapped_view(**kwargs):
            if g.user is None:
                return redirect(url_for('auth.login'))

            return view(**kwargs)

        return wrapped_view

装饰器返回新的视图函数，也即经过封装好原视图函数。新的函数会检查用户是否登入。如果没
有登入则跳转到登入页面。如果已经登入，则正常继续调用原视图函数。你在编写博客视图的时
候会用到这个装饰器。

.. _endpoints-and-urls:

端点和 URL
------------------

:func:`url_for` 基于视图名称和参数来生成视图的 URL。关联到视图的名称也被叫做 *端点*，
默认情况下是视图函数名称。

例如在之前的教程中，加入到应用工厂的  ``hello()`` 视图，端点名即为 ``'hello'`` ，
可以用 ``url_for('hello')`` 来获取其 URL。如果向视图传递了其他参数，应该用
``url_for('hello', who='World')`` 获取其 URL，你会在后面的内容中见到这个用法。

如果采用了蓝图，蓝图名将置于函数名前，作为端点的前缀。也就是说，在上文中编写的
``'auth'`` 蓝图中的 ``login`` 视图函数的端点是 ``'auth.login'`` 。

继续阅读 :doc:`templates` 部分。
