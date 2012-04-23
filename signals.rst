.. _signals:

信号
=======

.. versionadded:: 0.6

从 Flask 0.6 开始， Flask 集成了信号支持。这个支持由 `blinker`_ 库提供，
并且当它不可用时会优雅地退回。

什么是信号？信号通过发送发生在核心框架的其它地方或 Flask 扩展的动作
时的通知来帮助你解耦应用。简而言之，信号允许特定的发送端通知订阅者发
生了什么。

Flask 提供了几个信号，其它的扩展可能会提供更多。另外，请注意信号倾向于
通知订阅者，而不应该鼓励订阅者修改数据。你会注意到，信号似乎和一些内置的
装饰器做同样的事情（例如： :data:`~flask.request_started` 与
:meth:`~flask.Flask.before_request` 十分相似）。然而它们工作的方式是有
差异的。譬如核心的 :meth:`~flask.Flask.before_request` 处理程序以特定的顺
序执行，并且可以在返回响应之前放弃请求。相比之下，所有的信号处理器执行的
顺序没有定义，并且不修改任何数据。

信号之于其它处理器最大的优势是你可以在一秒钟的不同的时段上安全地订阅。譬
如这些临时的订阅对单元测试很有用。比如说你想要知道哪个模板被作为请求的一
部分渲染：信号允许你完全地了解这些。


订阅信号
----------------------

你可以使用信号的 :meth:`~blinker.base.Signal.connect` 方法来订阅信号。该
函数的第一个参数是信号发出时要调用的函数，第二个参数是可选的，用于确定信号
的发送端。退订一个信号，可以使用 :meth:`~blinker.base.Signal.disconnect`
方法。


对于所有的核心 Flask 信号，发送端都是发出信号的应用。当你订阅一个信号，请
确保也提供一个发送端，除非你确实想监听全部应用的信号。这在你开发一个扩展
的时候尤其正确。

比如这里有一个用于在单元测试中找出哪个模板被渲染和传入模板的变量的助手上
下文管理器::

    from flask import template_rendered
    from contextlib import contextmanager

    @contextmanager
    def captured_templates(app):
        recorded = []
        def record(sender, template, context, **extra):
            recorded.append((template, context))
        template_rendered.connect(record, app)
        try:
            yield recorded
        finally:
            template_rendered.disconnect(record, app)

这可以很容易地与一个测试客户端配对::

    with captured_templates(app) as templates:
        rv = app.test_client().get('/')
        assert rv.status_code == 200
        assert len(templates) == 1
        template, context = templates[0]
        assert template.name == 'index.html'
        assert len(context['items']) == 10

确保订阅使用了一个额外的 ``**extra`` 参数，这样当 Flask 对信号引入新参数
时你的调用不会失败。

代码中，从 `with` 块的应用 `app` 中流出的渲染的所有模板现在会被记录到
`templates` 变量。无论何时模板被渲染，模板对象的上下文中添加上它。

此外，也有一个方便的助手方法（ :meth:`~blinker.base.Signal.connected_to` ）
，它允许你临时地用它自己的上下文管理器把函数订阅到信号。因为上下文管理器的
返回值不能按那种方法给定，则需要把列表作为参数传入::

    from flask import template_rendered

    def captured_templates(app, recorded, **extra):
        def record(sender, template, context):
            recorded.append((template, context))
        return template_rendered.connected_to(record, app)

上面的例子会看起来是这样::

    templates = []
    with captured_templates(app, templates, **extra):
        ...
        template, context = templates[0]

.. admonition:: Blinker API 变更

   :meth:`~blinker.base.Signal.connected_to` 方法出现于 Blinker 1.1 。

创建信号
----------------

如果你想要在自己的应用中使用信号，你可以直接使用 blinker 库。最常见的用法
是在自定义的 :class:`~blinker.base.Namespace` 中命名信号。这也是大多数时候
推荐的做法::

    from blinker import Namespace
    my_signals = Namespace()

现在你可以这样创建新的信号::

    model_saved = my_signals.signal('model-saved')

这里使用唯一的信号名，简化调试。可以用 :attr:`~blinker.base.NamedSignal.name`
属性来访问信号名。

.. admonition:: 给扩展开发者

   如果你在编写一个 Flask 扩展并且你想优雅地在没有 blinker 安装时退化，你可以用
   :class:`flask.signals.Namespace` 这么做。

.. _signals-sending:

发送信号
---------------

如果你想要发出信号，调用 :meth:`~blinker.base.Signal.send` 方法可以做到。
它接受发送端作为第一个参数，和一些推送到信号订阅者的可选关键字参数::

    class Model(object):
        ...

        def save(self):
            model_saved.send(self)

永远尝试选择一个合适的发送端。如果你有一个发出信号的类，把 `self` 作为发送
端。如果你从一个随机的函数发出信号，把 ``current_app._get_current_object()``
作为发送端。

.. admonition:: 传递代理作为发送端

   永远不要向信号传递 :data:`~flask.current_app` 作为发送端，使用
   ``current_app._get_current_object()`` 作为替代。这样的原因是，
   :data:`~flask.current_app` 是一个代理，而不是真正的应用对象。


信号与 Flask 的请求上下文
-----------------------------------

信号在接受时，完全支持 :ref:`request-context` 。上下文局部变量在
:data:`~flask.request_started` 和 :data:`~flask.request_finished` 一贯可用，
所以你可以信任 :class:`flask.g` 和其它需要的东西。注意 :ref:`signals-sending`
和 :data:`~flask.request_tearing_down` 信号中描述的限制。


基于装饰器的信号订阅
------------------------------------

你可以在 Blinker 1.1 中容易地用新的
:meth:`~blinker.base.NamedSignal.connect_via` 装饰器订阅信号::

    from flask import template_rendered

    @template_rendered.connect_via(app)
    def when_template_rendered(sender, template, context, **extra):
        print 'Template %s is rendered with %s' % (template.name, context)

核心信号
------------

.. when modifying this list, also update the one in api.rst

下列是 Flask 中存在的信号:

.. data:: flask.template_rendered
   :noindex:

   当模板成功渲染的时候，这个信号会发出。这个信号与模板实例
   `template` 和上下文的词典（名为 `context` ）一起调用。

   订阅示例::

        def log_template_renders(sender, template, context, **extra):
            sender.logger.debug('Rendering template "%s" with context %s',
                                template.name or 'string template',
                                context)

        from flask import template_rendered
        template_rendered.connect(log_template_renders, app)

.. data:: flask.request_started
   :noindex:

   这个信号在处建立请求上下文之外的任何请求处理开始前发送。因为请求上下文
   已经被约束，订阅者可以用 :class:`~flask.request` 之类的标准全局代理访问
   请求。

   订阅示例::

        def log_request(sender, **extra):
            sender.logger.debug('Request context is set up')

        from flask import request_started
        request_started.connect(log_request, app)

.. data:: flask.request_finished
   :noindex:

   这个信号恰好在请求发送给客户端之前发送。它传递名为 `response` 的响应。

   订阅示例::

        def log_response(sender, response, **extra):
            sender.logger.debug('Request context is about to close down.  '
                                'Response: %s', response)

        from flask import request_finished
        request_finished.connect(log_response, app)

.. data:: flask.got_request_exception
   :noindex:

   这个信号在请求处理中抛出异常时发送。它在标准异常处理生效 *之前* ，甚至是
   在没有异常处理的情况下发送。异常本身会通过 `exception` 传递到订阅函数。

   Example subscriber::

        def log_exception(sender, exception, **extra):
            sender.logger.debug('Got exception during processing: %s', exception)

        from flask import got_request_exception
        got_request_exception.connect(log_exception, app)

.. data:: flask.request_tearing_down
   :noindex:

   这个信号在请求销毁时发送。它总是被调用，即使发生异常。当前监听这个信号
   的函数会在常规销毁处理后被调用，但这不是你可以信赖的。

   订阅示例::

        def close_db_connection(sender, **extra):
            session.close()

        from flask import request_tearing_down
        request_tearing_down.connect(close_db_connection, app)

   从 Flask 0.9 ，它会被传递一个 `exc` 关键字参数引用导致销毁的异常，如果
   有异常。

.. data:: flask.appcontext_tearing_down
   :noindex:

   这个信号在应用上下文销毁时发送。它总是被调用，即使发生异常。当前监听这个信号
   的函数会在常规销毁处理后被调用，但这不是你可以信赖的。

   订阅示例::

        def close_db_connection(sender, **extra):
            session.close()

        from flask import request_tearing_down
        appcontext_tearing_down.connect(close_db_connection, app)

   它会被传递一个 `exc` 关键字参数引用导致销毁的异常，如果有异常。

.. _blinker: http://pypi.python.org/pypi/blinker
