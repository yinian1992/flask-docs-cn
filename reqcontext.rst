.. _request-context:

请求上下文
===================

这部分文档描述了在 Flask 0.7 中的行为，与旧的行为基本一致，但有细小微妙的
差异。

这里推荐先阅读 :ref:`app-context` 章节。

深入上下文作用域
--------------------------

比如说你有一个应用函数返回用户应该跳转到的 URL 。想象它总是会跳转到 URL
的 ``next`` 参数，或 HTTP referrer ，或索引页::

    from flask import request, url_for

    def redirect_url():
        return request.args.get('next') or \
               request.referrer or \
               url_for('index')

如你所见，它访问了请求对象。当你试图在纯 Python shell 中运行这段代码时，
你会看见这样的异常:

>>> redirect_url()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'NoneType' object has no attribute 'request'

这有很大意义，因为我们当前并没有可以访问的请求。所以我们需要制造一个
请求并且绑定到当前的上下文。 :attr:`~flask.Flask.test_request_context` 方
法为我们创建一个 :class:`~flask.ctx.RequestContext`:

>>> ctx = app.test_request_context('/?next=http://example.com/')

可以通过两种方式利用这个上下文：使用 `with` 声明或是调用
:meth:`~flask.ctx.RequestContext.push` 和
:meth:`~flask.ctx.RequestContext.pop` 方法:

>>> ctx.push()

从这点开始，你可以使用请求对象:

>>> redirect_url()
u'http://example.com/'

直到你调用 `pop`:

>>> ctx.pop()

因为请求上下文在内部作为一个栈来维护，说以你可以多次压栈出栈。这在实现
内部重定向之类的东西时很方便。

更多如何从交互式 Python shell 中利用请求上下文的信息，请见 :ref:`shell`
章节。

上下文如何工作
---------------------

如果你研究 Flask WSGI 应用内部如何工作，你会找到和这非常相似的一段代码::

    def wsgi_app(self, environ):
        with self.request_context(environ):
            try:
                response = self.full_dispatch_request()
            except Exception, e:
                response = self.make_response(self.handle_exception(e))
            return response(environ, start_response)

:meth:`~Flask.request_context` 方法返回一个新的
:class:`~flask.ctx.RequestContext` 对象，并结合 `with` 声明来绑定上下文。
从相同线程中被调用的一切，直到 `with` 声明结束前，都可以访问全局的请求
变量（ :data:`flask.request` 和其它）。

请求上下文内部工作如同一个栈。栈顶是当前活动的请求。
:meth:`~flask.ctx.RequestContext.push` 把上下文添加到栈顶，
:meth:`~flask.ctx.RequestContext.pop` 把它移除栈。在出栈时，应用的
:func:`~flask.Flask.teardown_request` 函数也会被执行。

另一件需要注意的事是，请求上下文被压入栈时，并且没有当前应用的应用上下文，
它会自动创建一个 :ref:`app-context` 。

.. _callbacks-and-errors:

回调和错误
--------------------

在 Flask 中，请求处理时发生一个错误时会发生什么？这个特殊的行为在 0.7 中
变更了，因为我们想要更简单地得知实际发生了什么。新的行为相当简单:

1.  在每个请求之前，执行 :meth:`~flask.Flask.before_request` 上绑定的函数。
    如果这些函数中的某个返回了一个响应，其它的函数将不再被调用。任何情况
    下，无论如何这个返回值都会替换视图的返回值。
    
2.  如果 :meth:`~flask.Flask.before_request` 上绑定的函数没有返回一个响应，
    常规的请求处理将会生效，匹配的视图函数有机会返回一个响应。
    
3.  视图的返回值之后会被转换成一个实际的响应对象，并交给
    :meth:`~flask.Flask.after_request` 上绑定的函数适当地替换或修改它。
    
4.  在请求的最后，会执行 :meth:`~flask.Flask.teardown_request` 上绑定的函
    数。这总会发生，即使在一个未处理的异常抛出后或是没有请求前处理器执行过
    （例如在测试环境中你有时会想不执行请求前回调）。

现在错误时会发生什么？在生产模式中，如果一个异常没有被捕获，将调用
500 internal server 的处理。在生产模式中，即便异常没有被处理过，也会冒泡
给 WSGI 服务器。如此，像交互式调试器这样的东西可以提供丰富的调试信息。

在 0.7 中做出的重大变更，是内部服务器错误不再被请求后回调传递处理，而且
请求后回调也不再保证会执行。这使得内部的调度代码更简洁，易于定制和理解。

新的绑定于销毁请求的函数被认为是用于代替那些请求的最后绝对要发生的事。

销毁回调
------------------

销毁回调是是特殊的回调，因为它们在不同的点上执行。严格地说，它们不依赖实际
的请求处理，因为它们限定在 :class:`~flask.ctx.RequestContext` 的生命周期。
当请求上下文出栈时， :meth:`~flask.Flask.teardown_request` 上绑定的函数会
被调用。

这对于了解请求上下文的寿命是否因为在 with 声明中使用测试客户端或在命令行
中使用请求上下文时被延长很重要::

    with app.test_client() as client:
        resp = client.get('/foo')
        # the teardown functions are still not called at that point
        # even though the response ended and you have the response
        # object in your hand

    # only when the code reaches this point the teardown functions
    # are called.  Alternatively the same thing happens if another
    # request was triggered from the test client

从这些命令行操作中，很容易看出它的行为:

>>> app = Flask(__name__)
>>> @app.teardown_request
... def teardown_request(exception=None):
...     print 'this runs after request'
...
>>> ctx = app.test_request_context()
>>> ctx.push()
>>> ctx.pop()
this runs after request
>>>

注意销毁回调总是会被执行，即使没有请求前回调执行过，或是异常发生。测试系
统的特定部分也会临时地在不调用请求前处理器的情况下创建请求上下文。确保你
写的请求销毁处理器不会报错。

.. _notes-on-proxies:

留意代理
----------------

Flask 中提供的一些对象是其它对象的代理。背后的原因是，这些代理在线程间共享，
并且它们在必要的情景中被调度到限定在一个线程中的实际的对象。

大多数时间你不需要关心它，但是在一些例外情况中，知道一个对象实际上是代理是
有益的:

-   代理对象不会伪造它们继承的类型，所以如果你想运行真正的实例检查，你需要
    在被代理的实例上这么做（见下面的 `_get_current_object` ）。
-   如果对象引用是重要的（例如发送 :ref:`signals` ）

如果你需要访问潜在的被代理的对象，你可以使用
:meth:`~werkzeug.local.LocalProxy._get_current_object` 方法::

    app = current_app._get_current_object()
    my_signal.send(app)

错误时的上下文保护
-----------------------------

无论错误出现与否，在请求的最后，请求上下文会出栈，并且相关的所有数据会被
销毁。在开发中，当你想在异常发生时，长期地获取周围的信息，这会成为麻烦。
在 Flask 0.6 和更早版本中的调试模式，如果发生异常，请求上下文不会被弹出栈，
这样交互式调试器才能提供给你重要信息。

从 Flask 0.7 开始，我们设定 ``PRESERVE_CONTEXT_ON_EXCEPTION`` 配置变量来
更好地控制该行为。这个值默认与 ``DEBUG`` 的设置相关。当应用工作在调试模式
下时，上下文会被保护，而生产模式下相反。

不要在生产模式强制激活 ``PRESERVE_CONTEXT_ON_EXCEPTION`` ，因为它会导致在
异常时应用的内存泄露。不过，它在开发时获取开发模式下相同的错误行为来试图
调试一个只有生产设置下才发生的错误时很有用。
