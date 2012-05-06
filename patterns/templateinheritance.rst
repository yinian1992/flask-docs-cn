.. _template-inheritance:

模板继承
====================

Jinja 最为强大的地方在于他的模板继承功能，模板继承允许你创建一个基础的骨架模板，
这个模板包含您网站的通用元素，并且定义子模板可以重载的 **blocks** 。

听起来虽然复杂，但是其实非常基础。理解这个概念的最好方法就是开始一个例子。


基础模板
-------------

在被叫做 ``layout.html`` 的这个模板中，定义了一个简单的 HTML 文档骨架，您可以
将这个骨架用作一个简单的双栏页面。而子模板负责将空白的块填充上内容:

.. sourcecode:: html+jinja

    <!doctype html>
    <html>
      <head>
        {% block head %}
        <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
        <title>{% block title %}{% endblock %} - My Webpage</title>
        {% endblock %}
      </head>
    <body>
      <div id="content">{% block content %}{% endblock %}</div>
      <div id="footer">
        {% block footer %}
        &copy; Copyright 2010 by <a href="http://domain.invalid/">you</a>.
        {% endblock %}
      </div>
    </body>

在这个例子中，使用 ``{% block %}`` 标签定义了四个子模板可以重载的块。 `block` 
标签所做的的所有事情就是告诉模板引擎: 一个子模板可能会重写父模板的这个部分。

子模板
--------------

子模板看起来像这个样子:

.. sourcecode:: html+jinja

    {% extends "layout.html" %}
    {% block title %}Index{% endblock %}
    {% block head %}
      {{ super() }}
      <style type="text/css">
        .important { color: #336699; }
      </style>
    {% endblock %}
    {% block content %}
      <h1>Index</h1>
      <p class="important">
        Welcome on my awesome homepage.
    {% endblock %}

The ``{% extends %}`` tag is the key here. It tells the template engine that
this template "extends" another template.  When the template system evaluates
this template, first it locates the parent.  The extends tag must be the
first tag in the template.  To render the contents of a block defined in
the parent template, use ``{{ super() }}``.

``{% extends %}`` 标签是这里的关键，它通知模板引擎这个模板继承了另外的模板，当
模板系统解析模板时，他首先找到父模板。 ``extends`` 标签必须是模板中的第一个标签。
为了在一个中块显示父模板中定义的对应块的内容，使用 ``{{ super() }}`` 。
