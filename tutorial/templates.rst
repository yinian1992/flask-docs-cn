.. currentmodule:: flask

.. _templates:

模板
=========

你已经为应用写好了认证视图，但你在运行服务器之后尝试访问任何 URL 都会见到
``TemplateNotFound`` 错误。这是因为视图调用了 :func:`render_template` 函数，但是
我们还没有编写模板。模板文件应该存放在 ``flaskr`` 包中的 ``templates`` 目录下。

在你的应用里，会用到模板来渲染显示在用户浏览器中的 `HTML`_ 。在 Flask 中，默认使用
`Jinja`_ 模板引擎来 *自动转义* 渲染到 HTML 模板中的数据。这意味着渲染用户输入也是安
全的，任何用户输入的可能污染 HTML 的东西，比如 ``<`` 和 ``>`` 这种将会被 *转义* 成
*安全* 的值，既能保证在浏览器中显示一致，又避免了未预期的结果。

Jinja 的写法与直接写 Python 几乎一样。Jinja 用特殊的分隔符来区分 Jinja 语句和模板
中的静态内容。 ``{{`` 和 ``}}`` 包裹的内容即是输出最终文档的 Jinja 表达式。
``{%`` 和 ``%}`` 表示控制流语句，比如 ``if`` 和 ``for`` 。因为块级语句中的静态文本
可能会产生缩进，所以 Jinja 中用开始和结束标记指示块级语句，而不是像 Python 一样用缩
进。


.. _Jinja: http://jinja.pocoo.org/docs/templates/
.. _HTML: https://developer.mozilla.org/docs/Web/HTML

.. _the-base-layout:

基础布局
---------------

应用的各个页面应采用相同的基础布局，而主题内容可以不同。模板可以 *继承* 基础模板并且
覆盖部分模板，而不是手动重写整个 HTML 结构。

.. code-block:: html+jinja
    :caption: ``flaskr/templates/base.html``

    <!doctype html>
    <title>{% block title %}{% endblock %} - Flaskr</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
    <nav>
      <h1>Flaskr</h1>
      <ul>
        {% if g.user %} 
          <li><span>{{ g.user['username'] }}</span>
          <li><a href="{{ url_for('auth.logout') }}">Log Out</a>
        {% else %}
          <li><a href="{{ url_for('auth.register') }}">Register</a>
          <li><a href="{{ url_for('auth.login') }}">Log In</a>
        {% endif %}
      </ul>
    </nav>
    <section class="content">
      <header>
        {% block header %}{% endblock %}
      </header>
      {% for message in get_flashed_messages() %}
        <div class="flash">{{ message }}</div>
      {% endfor %}
      {% block content %}{% endblock %}
    </section>

在模板中也可以访问 :data:`g` 对象。取决于 ``g.user`` 是否存在（
由 ``load_logged_in_user`` 设置在 :data:`g` 上），要么显示用户名和登出链接，要么
显示注册和登入链接。同样， :func:`url_for` 也可以在模板中使用，用于生成视图的 URL，
而不是手写 URL。

在页面标题后，内容之前，模板遍历了 :func:`get_flashed_messages` 返回的消息。在此处
展示视图中 :func:`flash` 暂存的错误信息。

此处定义了三个块，其他模板可以覆盖这些块：

#.  ``{% block title %}`` 显示浏览器标签页和窗口的标题。

#.  ``{% block header %}`` 类似 ``title`` ，显示页面中的标题。

#.  ``{% block content %}`` 是每个页面中的内容，比如登入表单或博客文章。

基础模板应直接放置在 ``templates`` 目录下。为保持其他模板整齐有序，蓝图的模板应置于
蓝图文件夹下。

.. _register:

注册
--------

.. code-block:: html+jinja
    :caption: ``flaskr/templates/auth/register.html``

    {% extends 'base.html' %}

    {% block header %}
      <h1>{% block title %}Register{% endblock %}</h1>
    {% endblock %}

    {% block content %}
      <form method="post">
        <label for="username">Username</label>
        <input name="username" id="username" required>
        <label for="password">Password</label>
        <input type="password" name="password" id="password" required>
        <input type="submit" value="Register">
      </form>
    {% endblock %}


``{% extends 'base.html' %}`` 让 Jinja 允许这个模板替换基础模板中的块。
``{% block %}`` 标签内的内容将会覆盖基础模板中的块。

这里用到了一个很实用的模式，把 ``{% block title %}`` 放在 ``{% block header %}``
里面。这样可以同时设置 title 块和 header 块的值，窗口标题和页面标题保持一致，而不是
手写两遍。

这里的 ``input`` 标签使用了 ``required`` 属性。设置了这个属性后，字段未填写内容将会
导致浏览器拒绝提交表单。如果用户正在使用不支持该特性的老版本浏览器，或者用浏览器以外的
东西提交请求，你就需要在 Flask 视图中验证数据。即便客户端验证已经相当完善，服务端验证
依然相当重要。

.. _log-in:

登入
------

与注册页面的模板基本一模一样，除了标题和提交按钮。

.. code-block:: html+jinja
    :caption: ``flaskr/templates/auth/login.html``

    {% extends 'base.html' %}

    {% block header %}
      <h1>{% block title %}Log In{% endblock %}</h1>
    {% endblock %}

    {% block content %}
      <form method="post">
        <label for="username">Username</label>
        <input name="username" id="username" required>
        <label for="password">Password</label>
        <input type="password" name="password" id="password" required>
        <input type="submit" value="Log In">
      </form>
    {% endblock %}

.. _register-a-user:

注册用户
---------------

现在认证模板已经写好了，你可以注册用户了。确保服务器正在运行（如果没有就运行
``flask run`` ），然后访问 http://127.0.0.1:5000/auth/register 。

尝试在不填写表单的情况下直接点击“注册”按钮，你会看到浏览器报错。删除
``register.html`` 模板中的 ``required`` 属性再点击“注册”，浏览器将不再报错，页面会
重新加载并显示视图中 :func:`flash` 发送的错误消息。

填好用户名和密码并提交后，将会重定向到登入界面。试试输入错误的用户名，或是正确的用户名
但错误的密码。如果登入成功，会看到报错信息，因为跳转到的 ``index`` 视图还没写好。

继续阅读 :doc:`static` 部分。
