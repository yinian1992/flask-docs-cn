.. _deferred-callbacks:

延迟请求回调
==========================

Flask 的设计原则中有一条是响应对象被创建并在一条可能的回调链中传递，而在
这条回调链但中的任意一个回调，您都可以修改或者替换掉他们。当请求开始被
处理时，还没有响应对象，响应对象将在这一过程中，被某个视图函数或者系统
的其他组件按照实际需要来闯将。

但是，如果您想在响应过程的结尾修改响应对象，但是这是对象还不存在，那么会发生
什么呢？一个常见的例子是您可能需要在 before-request 函数当中在响应对象上
设定 Cookie 。

解决这一情况的一个常用方法是改变代码的逻辑，将这一部分代码迁移到
after-request 回调中。然而有些时候这种迁移并不是一个非常容易的敬礼
而且可能使代码看起来非常糟糕。

一个可能的替代方法是将一些回调函数绑定到 :data:`~flask.g` 对象中。然后在
请求结束的时候调用他们。使用这种方法，您可以从应用里的任何一个地方来指定
代码延迟执行。


装饰器
-------------

下面的装饰器就是关键，它将一个函数注册到 :data:`~flask.g` 对象上的
一个函数列表中::

    from flask import g

    def after_this_request(f):
        if not hasattr(g, 'after_request_callbacks'):
            g.after_request_callbacks = []
        g.after_request_callbacks.append(f)
        return f


Calling the Deferred
--------------------

Now you can use the `after_this_request` decorator to mark a function to
be called at the end of the request.  But we still need to call them.  For
this the following function needs to be registered as
:meth:`~flask.Flask.after_request` callback::

    @app.after_request
    def call_after_request_callbacks(response):
        for callback in getattr(g, 'after_request_callbacks', ()):
            response = callback(response)
        return response


A Practical Example
-------------------

Now we can easily at any point in time register a function to be called at
the end of this particular request.  For example you can remember the
current language of the user in a cookie in the before-request function::

    from flask import request

    @app.before_request
    def detect_user_language():
        language = request.cookies.get('user_lang')
        if language is None:
            language = guess_language_from_request()
            @after_this_request
            def remember_language(response):
                response.set_cookie('user_lang', language)
        g.language = language
