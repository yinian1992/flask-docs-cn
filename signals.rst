.. _signals:

信号
=======

.. versionadded:: 0.6

从 Flask 0.6 开始， Flask 集成了对信号的支持。这个功能的由优秀的 `Blinker`_ 库提
供支持，并且 Flask 会在该库不可用时优雅地回退。

什么是信号？当行为发生在核心框架的其他地方或是其他 Flask 扩展中时，信号发送相应的通
知，并以此方式帮助你解耦应用。简而言之，信号允许特定的发送者通知订阅者发生了什么。

Flask 本身提供了几个信号，其他的扩展可能会提供更多信号。另外，请注意信号是用来向订
阅者发送通知，而不建议订阅者修改数据。你会注意到，信号似乎和一些内置的装饰器异曲同工
（例如：:data:`~flask.request_started` 就与 :meth:`~flask.Flask.before_request`
十分相似）。然而，它们工作的方式是有许多差异的。核心的
:meth:`~flask.Flask.before_request` 处理函数以特定的顺序执行，并且可以在返回响应之
前放弃响应请求。相比之下，所有的信号处理函数的执行顺序是没有定义的，并且也不修改任何数
据。

信号之于其他处理函数的最大优势是，你可以在同一时刻安全地订阅多个信号。譬如这种临时的信
号订阅对于单元测试而言非常有用。比如说你想要知道哪个模板被作为请求的一部分渲染：信号恰
好允许你完成这一工作。

.. _subscribing-to-signals:

订阅信号
----------------------

你可以使用信号的 :meth:`~blinker.base.Signal.connect` 方法来订阅信号。第一个参数是
信号发出时要调用的函数，第二个参数是可选的，用于确定信号的发送者。退订一个信号，则使用
:meth:`~blinker.base.Signal.disconnect` 方法。


对于所有的 Flask 核心信号，发送者都是发出信号的 Flask 应用。除非你确实想监听所有应用
发出的信号，否则在你订阅信号时，请确保提供确定发送者的参数。这在你开发一个扩展的时候
尤其重要。

例如，下面是一个用于在单元测试中获取渲染了哪个模板和向模板传入了的哪些变量的辅助上下
文管理器::

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

它很容易就可以与测试客户端配套使用::

    with captured_templates(app) as templates:
        rv = app.test_client().get('/')
        assert rv.status_code == 200
        assert len(templates) == 1
        template, context = templates[0]
        assert template.name == 'index.html'
        assert len(context['items']) == 10

确保订阅使用了一个额外的 ``**extra`` 参数，这样你的调用才不会在 Flask 向信号引入新
参数时失败。

在上面的代码中，从 `with` 块级语句中的应用 `app` 发出的所有正在渲染的模板将会被记录
到 `templates` 变量中。无论何时渲染模板，模板对象和模板上下文都会被添加到这个变量里。

此外，也有一个方便的辅助方法 :meth:`~blinker.base.Signal.connected_to`，它允许你
临时把一个函数订阅到信号，并使用信号自己的上下文管理器。由于这个上下文管理器的返回值
不能像刚才那样指定，所以必须传入作为参数的列表::

    from flask import template_rendered

    def captured_templates(app, recorded, **extra):
        def record(sender, template, context):
            recorded.append((template, context))
        return template_rendered.connected_to(record, app)

上面的例子会变成这样::

    templates = []
    with captured_templates(app, templates, **extra):
        ...
        template, context = templates[0]

.. admonition:: Blinker API 变更

   :meth:`~blinker.base.Signal.connected_to` 在 Blinker 1.1 中引入。

.. _creating-signals:

创建信号
----------------

如果想要在自己的应用中使用信号，可以直接使用 Blinker 库。最常见的用法是在自定义的
:class:`~blinker.base.Namespace` 中命名信号。这也是大多数时候推荐的做法::

    from blinker import Namespace
    my_signals = Namespace()

现在你可以这样创建新的信号::

    model_saved = my_signals.signal('model-saved')

这里确保信号名称唯一，以简化调试。你可以访问 :attr:`~blinker.base.NamedSignal.name`
属性来获取信号的名称。

.. admonition:: 写给扩展的开发者

   如果你正在编写 Flask 扩展，并且你想在没有 Blinker 安装的情况下优雅回退信号功能，
   你可以用 :class:`flask.signals.Namespace` 实现这一需求。

.. _signals-sending:

发送信号
---------------

调用 :meth:`~blinker.base.Signal.send` 即可发送信号。它接受的第一个参数是信号的发
送者，然后是可选的关键字参数，这些关键字参数也会被推送给信号的订阅者::

    class Model(object):
        ...

        def save(self):
            model_saved.send(self)

尽可能选择一个合适的信号发送者。如果你有一个发出信号的类，可以传入 ``self`` 作为信号
的发送者。如果你从一个随机的函数中发出信号，可以传入
``current_app._get_current_object()`` 作为信号的发送者。

.. admonition:: 向信号传入代理作为发送者

   永远不要向信号传入 :data:`~flask.current_app` 作为发送者，而是应该使用
   ``current_app._get_current_object()`` 作为替代。原因是
   :data:`~flask.current_app` 只是一个应用对象的代理，而不是真正的应用对象。

.. _signals-and-flasks-request-context:

信号与 Flask 请求上下文
-----------------------------------

信号在接收时，提供 :ref:`request-context` 的完整支持。上下文本地的变量在
:data:`~flask.request_started` 和 :data:`~flask.request_finished` 之间一贯可用，
所以你可以依赖于 :class:`flask.g` 和其他与请求上下文绑定的东西。只是需要注意
:ref:`signals-sending` 和 :data:`~flask.request_tearing_down` 信号中描述的限制。

.. _decorator-based-signal-subscriptions:

基于装饰器的信号订阅
------------------------------------

在 Blinker 1.1 中，你可以很容易地用新引入的
:meth:`~blinker.base.NamedSignal.connect_via` 装饰器订阅信号::

    from flask import template_rendered

    @template_rendered.connect_via(app)
    def when_template_rendered(sender, template, context, **extra):
        print 'Template %s is rendered with %s' % (template.name, context)

.. _core-signals:

核心信号
------------

完整的内置信号列表见 :ref:`core-signals-list` 部分。

.. _Blinker: https://pypi.org/project/blinker/
