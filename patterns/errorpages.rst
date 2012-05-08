自定义错误页面
==================

Flask 自带了很顺手的 :func:`~flask.abort` 函数用于以一个 HTTP 失败代码
中断一个请求，他也会提供一个非常简单的错误页面，用于提供一些基础的描述。
这个页面太朴素了以至于缺乏一点灵气。

依赖于错误代码的不同，用户看到某个错误的可能性大小也不同。

通常的错误代码
------------------

下面列出了一些用户经常遇到的错误代码，即使在这个应用准确无误的情况下也可能发生:

*404 Not Found*
    经典的“哎呦，您输入的 URL 当中有错误”消息。这个消息太常见了，即使是
    互联网的新手也知道 404 代号的意义: 该死，我寻找的东西不在那儿。确保
    404 页面上有一些有用的信息是一个好主意，至少应该提供一个返回主页的链接。

*403 Forbidden*
    如果您的网站包含一些类型的访问控制，您必须向非法的请求返回 403 错误代号。
    所以请确保用户不会在试图访问了一个禁止访问的资源后不知所措。

*410 Gone*
    您知道 404 Not Found 代号还有一个兄弟名为 410 Gone 么? 很少有人真正实现
    它，您可以考虑将其返回给对以前曾经存在、但是现在已经删除的资源的请求，而
    不是直接返回 404 。 如果您还没有从数据库里永久删除这个文档，仅仅是将他们
    标记为删除。那么可以为用户展示一个消息，说明他们寻找的东西已经永远删除了。

*500 Internal Server Error*
    通常在出现编程错误或者服务器过载的时候会返回这个错误代号。在这里放一个
    漂亮的页面是一个非常好的主意。因为您的应用 *总有一天* 会出现错误(请参考
    :ref:`application-errors` )


错误处理器
--------------

一个错误处理器是一个类似于视图函数的函数，但是它在错误发生时被执行，并且
错误被当成一个参数传递进来。一般来说错误可能是 :exc:`~werkzeug.exception.HTTPException` ，
但是在有些情况下会是其他错误: 内部服务器的错误的处理器在被执行时，将会
同时得到被捕捉到的实际代码错误作为参数。

错误处理器和要捕捉的错误代码使用 :meth:`~flask.Flask.errorhandler` 装饰器注册。
请记住 Flask *不会* 替您设置错误代码，所以请确保在返回 response 对象时，提供了
对应的 HTTP 状态代码。

如下实现了一个 “404 Page Not Found” 错误处理的例子::

    from flask import render_template

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('404.html'), 404

一个示例模板可能会如下所示:

.. sourcecode:: html+jinja

   {% extends "layout.html" %}
   {% block title %}Page Not Found{% endblock %}
   {% block body %}
     <h1>Page Not Found</h1>
     <p>What you were looking for is just not there.
     <p><a href="{{ url_for('index') }}">go somewhere nice</a>
   {% endblock %}
