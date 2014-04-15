.. _tutorial-templates:

步骤 6: 模板
=====================

接下来我们应该创建模板了。如果我们现在请求 URL，只会得到 Flask 无法找到模板的异常。
模板使用 `Jinja2`_ 语法并默认开启自动转义。这意味着除非你使用
:class:`~flask.Markup` 标记或在模板中使用 ``|safe`` 过滤器，否则 Jinja 2 会
确保特殊字符，比如 ``<`` 或 ``>`` 被转义为等价的 XML 实体。

我们也会使用模板继承在网站的所有页面中重用布局。

将下面的模板放在 `templates` 文件夹里:

.. _Jinja2: http://jinja.pocoo.org/2/documentation/templates

layout.html
-----------

这个模板包含 HTML 主体结构、标题和一个登入链接（用户已登入则提供登出）。
如果有，它也会显示闪现消息。 ``{% block body %}`` 块可以被子模板中相同名
字的块（ ``body`` ）替换。

:class:`~flask.session` 字典在模板中也是可用的。你可以用它来检查用户是否已登入。
注意，在 Jinja 中你可以访问不存在的对象/字典属性或成员。比如下面的代码，
即便 ``'logged_in'`` 键不存在，仍然可以正常工作:

.. sourcecode:: html+jinja

    <!doctype html>
    <title>Flaskr</title>
    <link rel=stylesheet type=text/css href="{{ url_for('static', filename='style.css') }}">
    <div class=page>
      <h1>Flaskr</h1>
      <div class=metanav>
      {% if not session.logged_in %}
        <a href="{{ url_for('login') }}">log in</a>
      {% else %}
        <a href="{{ url_for('logout') }}">log out</a>
      {% endif %}
      </div>
      {% for message in get_flashed_messages() %}
        <div class=flash>{{ message }}</div>
      {% endfor %}
      {% block body %}{% endblock %}
    </div>

show_entries.html
-----------------

这个模板继承了上面的 `layout.html` 模板来显示消息。注意 `for` 循环会遍历并输出
所有 :func:`~flask.render_template` 函数传入的消息。我们还告诉表单使用 `HTTP`
的 `POST` 方法提交信息到 `add_entry` 函数:

.. sourcecode:: html+jinja

    {% extends "layout.html" %}
    {% block body %}
      {% if session.logged_in %}
        <form action="{{ url_for('add_entry') }}" method=post class=add-entry>
          <dl>
            <dt>Title:
            <dd><input type=text size=30 name=title>
            <dt>Text:
            <dd><textarea name=text rows=5 cols=40></textarea>
            <dd><input type=submit value=Share>
          </dl>
        </form>
      {% endif %}
      <ul class=entries>
      {% for entry in entries %}
        <li><h2>{{ entry.title }}</h2>{{ entry.text|safe }}
      {% else %}
        <li><em>Unbelievable.  No entries here so far</em>
      {% endfor %}
      </ul>
    {% endblock %}

login.html
----------

最后是登入模板，只是简单地显示一个允许用户登入的表单:

.. sourcecode:: html+jinja

    {% extends "layout.html" %}
    {% block body %}
      <h2>Login</h2>
      {% if error %}<p class=error><strong>Error:</strong> {{ error }}{% endif %}
      <form action="{{ url_for('login') }}" method=post>
        <dl>
          <dt>Username:
          <dd><input type=text name=username>
          <dt>Password:
          <dd><input type=password name=password>
          <dd><input type=submit value=Login>
        </dl>
      </form>
    {% endblock %}

继续 :ref:`tutorial-css` 。
