.. currentmodule:: flask

.. _blog-blueprint:

博客蓝图
==============

这里将会用与编写认证蓝图时相同的技术来编写博客蓝图。博客蓝图应提供文章列表、允许登入
用户发表文章以及允许作者修改、删除文章等功能。

在你实现各个视图时，请保持开发服务器一直在运行。保存修改后，即可在浏览器中访问相应 URL
来测试功能。

.. _the-blueprint:

蓝图
-------------

定义蓝图，然后在应用工厂中注册。

.. code-block:: python
    :caption: ``flaskr/blog.py``

    from flask import (
        Blueprint, flash, g, redirect, render_template, request, url_for
    )
    from werkzeug.exceptions import abort

    from flaskr.auth import login_required
    from flaskr.db import get_db

    bp = Blueprint('blog', __name__)

在应用工厂中导入蓝图，用
:meth:`app.register_blueprint() <Flask.register_blueprint>` 注册。把这段新增的
代码放在工厂函数的最后，但要在返回应用对象之前。

.. code-block:: python
    :caption: ``flaskr/__init__.py``

    def create_app():
        app = ...
        # existing code omitted

        from . import blog
        app.register_blueprint(blog.bp)
        app.add_url_rule('/', endpoint='index')

        return app

与认证蓝图不同的是，博客蓝图没有设置 ``url_prefix`` 。那么 ``index`` 的 URL 会是
``/`` ， ``create`` 视图的 URL 会是 ``/create`` ，以此类推。博客是 Flaskr 的主要
功能，所以应当把博客索引作为主页。

尽管如此，上面定义的  ``index`` 视图端点仍是带前缀的 ``blog.index`` 。一些认证视图
引用了不带前缀的 ``index`` 端点。 :meth:`app.add_url_rule() <Flask.add_url_rule>`
把 ``'index'`` 端点和 URL ``/``  关联到一起，这样
``url_for('index')`` 和 ``url_for('blog.index')`` 都能如预期工作，生成的 URL 都是
``/`` 。

在其他应用中，也许你会给博客视图设置一个 ``url_prefix`` ，并且在应用工厂中定义另一个
像 ``hello`` 视图一样的 ``index`` 视图，那么 ``index`` 和 ``blog.index`` 的端点和
URL 则会不同。

.. _index:

索引页
-------

索引页会按时间先后，展示所有文章的列表，新发表的在前。这里用到 ``JOIN`` 来从 ``user``
表中查询作者信息。

.. code-block:: python
    :caption: ``flaskr/blog.py``

    @bp.route('/')
    def index():
        db = get_db()
        posts = db.execute(
            'SELECT p.id, title, body, created, author_id, username'
            ' FROM post p JOIN user u ON p.author_id = u.id'
            ' ORDER BY created DESC'
        ).fetchall()
        return render_template('blog/index.html', posts=posts)

.. code-block:: html+jinja
    :caption: ``flaskr/templates/blog/index.html``

    {% extends 'base.html' %}

    {% block header %}
      <h1>{% block title %}Posts{% endblock %}</h1>
      {% if g.user %}
        <a class="action" href="{{ url_for('blog.create') }}">New</a>
      {% endif %}
    {% endblock %}

    {% block content %}
      {% for post in posts %}
        <article class="post">
          <header>
            <div>
              <h1>{{ post['title'] }}</h1>
              <div class="about">by {{ post['username'] }} on {{ post['created'].strftime('%Y-%m-%d') }}</div>
            </div>
            {% if g.user['id'] == post['author_id'] %}
              <a class="action" href="{{ url_for('blog.update', id=post['id']) }}">Edit</a>
            {% endif %}
          </header>
          <p class="body">{{ post['body'] }}</p>
        </article>
        {% if not loop.last %}
          <hr>
        {% endif %}
      {% endfor %}
    {% endblock %}

当用户登入后， ``header`` 块会添加一个指向 ``create`` 视图的链接。如果用户是文章的
作者，还会看到链接到 ``update`` 视图的“编辑文章”链接。 ``loop.last`` 是一个
`Jinja 里的 for 循环 <Jinja for loops>`_ 里可用的特殊变量，用于在文章间添加水平分
割线，以从视觉上区分它们。

.. _Jinja for loops: http://jinja.pocoo.org/docs/templates/#for

.. _create:

创建文章
---------

``create` 视图与 ``register`` 视图的工作方式一样。要么显示表单，要么把通过验证的数据
作为博客文章添加到数据库中，要么显示验证错误。

之前写好的 ``login_required`` 装饰器现在可以用在博客视图上。用户必须登入后才能访问
这些视图，否则会被跳转到登入页面。

.. code-block:: python
    :caption: ``flaskr/blog.py``

    @bp.route('/create', methods=('GET', 'POST'))
    @login_required
    def create():
        if request.method == 'POST':
            title = request.form['title']
            body = request.form['body']
            error = None

            if not title:
                error = 'Title is required.'

            if error is not None:
                flash(error)
            else:
                db = get_db()
                db.execute(
                    'INSERT INTO post (title, body, author_id)'
                    ' VALUES (?, ?, ?)',
                    (title, body, g.user['id'])
                )
                db.commit()
                return redirect(url_for('blog.index'))

        return render_template('blog/create.html')

.. code-block:: html+jinja
    :caption: ``flaskr/templates/blog/create.html``

    {% extends 'base.html' %}

    {% block header %}
      <h1>{% block title %}New Post{% endblock %}</h1>
    {% endblock %}

    {% block content %}
      <form method="post">
        <label for="title">Title</label>
        <input name="title" id="title" value="{{ request.form['title'] }}" required>
        <label for="body">Body</label>
        <textarea name="body" id="body">{{ request.form['body'] }}</textarea>
        <input type="submit" value="Save">
      </form>
    {% endblock %}

.. _update:

编辑文章
---------

``update` 和 ``delete`` 视图会根据 ``id`` 从数据库查询 ``post`` ，并且确认作者与
登入用户是否为同一人。为了避免重复编写相同的代码，这里把获取文章的行为写成了一个函数，
以便在不同的视图中调用。

.. code-block:: python
    :caption: ``flaskr/blog.py``

    def get_post(id, check_author=True):
        post = get_db().execute(
            'SELECT p.id, title, body, created, author_id, username'
            ' FROM post p JOIN user u ON p.author_id = u.id'
            ' WHERE p.id = ?',
            (id,)
        ).fetchone()

        if post is None:
            abort(404, "Post id {0} doesn't exist.".format(id))

        if check_author and post['author_id'] != g.user['id']:
            abort(403)

        return post

:func:`abort` 会抛出一个特殊的异常，这个异常会返回 HTTP 状态码。这个异常也接受错误信
息作为可选参数，如果没有设置错误信息，则显示默认错误信息。 ``404`` 意味着“页面未找
到”，而 ``403`` 则是“禁止访问”。（ ``401`` 是“未认证”，但这里我们把用户重定向到登入
页，而不是直接返回状态码。）

``check_author`` 参数用于控制是否检查 ``post`` 的作者与登入用户是否相同。你会在编写
展示单独文章的页面时用到这个参数，这对一般用户无关紧要，因为他们不会去修改文章。

.. code-block:: python
    :caption: ``flaskr/blog.py``

    @bp.route('/<int:id>/update', methods=('GET', 'POST'))
    @login_required
    def update(id):
        post = get_post(id)

        if request.method == 'POST':
            title = request.form['title']
            body = request.form['body']
            error = None

            if not title:
                error = 'Title is required.'

            if error is not None:
                flash(error)
            else:
                db = get_db()
                db.execute(
                    'UPDATE post SET title = ?, body = ?'
                    ' WHERE id = ?',
                    (title, body, id)
                )
                db.commit()
                return redirect(url_for('blog.index'))

        return render_template('blog/update.html', post=post)

与迄今为止写过的视图不同的是， ``update`` 视图接受一个参数 ``id`` ，对应路由中的
``<int:id>`` 。真实的 URL 会是 ``/1/update`` 这样。。Flask 会捕获其中的 ``1`` ，
确保其是一个 :class:`int` 实例，然后作为 ``id`` 参数。如果你没有指定 ``int:`` ，只
是写成 ``<id>`` ，那么这个参数将是个字符串。在生成编辑文章页面的 URL 时，也需要给
:func:`url_for` 传递同样的 ``id`` 参数，这样它才知道如何填充 URL 中的参数：
``url_for('blog.update', id=post['id'])`` 。在上面的 ``index.html`` 文件中也是
如此。

``create`` 和 ``update`` 非常相似。主要区别在于 ``update`` 用到了一个 ``post`` 对
象和 ``UPDATE`` 查询，而不是 ``INSERT`` 查询。经过一番精心的重构，其实只用一个视图
函数和一套模板实现这两个功能，但在本教程中为了直观清晰，仍采用了独立的实现。


.. code-block:: html+jinja
    :caption: ``flaskr/templates/blog/update.html``

    {% extends 'base.html' %}

    {% block header %}
      <h1>{% block title %}Edit "{{ post['title'] }}"{% endblock %}</h1>
    {% endblock %}

    {% block content %}
      <form method="post">
        <label for="title">Title</label>
        <input name="title" id="title"
          value="{{ request.form['title'] or post['title'] }}" required>
        <label for="body">Body</label>
        <textarea name="body" id="body">{{ request.form['body'] or post['body'] }}</textarea>
        <input type="submit" value="Save">
      </form>
      <hr>
      <form action="{{ url_for('blog.delete', id=post['id']) }}" method="post">
        <input class="danger" type="submit" value="Delete" onclick="return confirm('Are you sure?');">
      </form>
    {% endblock %}

这个模板有两个表单。第一个把编辑后的数据提交给当前页面（ ``/<id>/update`` ）。另一个
表单指定了 ``action`` 属性，且仅包含一个按钮，用于提交删除文件的请求。按钮上用了一些
JavaScript 实现了一个确认表单提交的对话框。

``{{ request.form['title'] or post['title'] }}`` 模式用于选择表单中显示的数据。
表单尚未提交时，应该显示原始 ``post`` 数据。但如果提交了无效表单数据，你应该展示提交
的数据，这样用户才能更正错误，所以也用到了 ``request.form`` 。 :data:`request` 是
又一个可以在模板中访问到的变量。

.. _delete:

删除文章
---------

删除视图没有模板，删除按钮是 ``update.html`` 的一部分，并提交到 URL
``/<id>/delete`` 。因为没有模板，它只需要处理 ``POST`` 方法然后重定向到 ``index``
视图。

.. code-block:: python
    :caption: ``flaskr/blog.py``

    @bp.route('/<int:id>/delete', methods=('POST',))
    @login_required
    def delete(id):
        get_post(id)
        db = get_db()
        db.execute('DELETE FROM post WHERE id = ?', (id,))
        db.commit()
        return redirect(url_for('blog.index'))

恭喜你，你已经完成了应用的编写工作！稍微花一些时间，在浏览器里测试应用的各项功能。
然而，项目尚未完结，同志仍需努力。

继续阅读 :doc:`install` 部分。
