.. _api:

API
===

.. module:: flask

这部分文档涵盖了 Flask 的所有接口。对于那些 Flask 依赖外部库的部分，我们
这里提供了最重要的部分的文档，并且提供其官方文档的链接。


应用对象
------------------

.. autoclass:: Flask
   :members:
   :inherited-members:


蓝图对象
-----------------

.. autoclass:: Blueprint
   :members:
   :inherited-members:

进入的请求对象
---------------------

.. autoclass:: Request
   :members:

   .. attribute:: form

      一个包含解析过的从 `POST` 或 `PUT` 请求发送的表单对象的
      :class:`~werkzeug.datastructures.MultiDict` 。请注意上传的文件不会在这里，而是在
      :attr:`files` 属性中。

   .. attribute:: args

      一个包含解析过的查询字符串（ URL 中问号后的部分）内容的
      :class:`~werkzeug.datastructures.MultiDict` 。

   .. attribute:: values

      一个包含 :attr:`form` 和 :attr:`args` 全部内容的
      :class:`~werkzeug.datastructures.CombinedMultiDict` 。

   .. attribute:: cookies

      一个包含请求中传送的所有 cookie 内容的  :class:`dict` 。

   .. attribute:: stream

      如果表单提交的数据没有以已知的 mimetype 编码，为性能考虑，数据会不经
      修改存储在这个流中。大多数情况下，使用可以把数据提供为字符串的
      :attr:`data` 是更好的方法。流只返回一次数据。

   .. attribute:: headers

      进入请求的标头存为一个类似字典的对象。

   .. attribute:: data

      如果进入的请求数据是 Flask 不能处理的 mimetype ，数据将作为字符串
      存于此。

   .. attribute:: files

      一个包含 `POST` 和 `PUT` 请求中上传的文件的
      :class:`~werkzeug.datastructures.MultiDict` 。每个文件存储为 
      :class:`~werkzeug.datastructures.FileStorage` 对象。其基本的行为类似你在 Python 中
      见到的标准文件对象，差异在于这个对象有一个
      :meth:`~werkzeug.datastructures.FileStorage.save` 方法可以把文件存储到文件系统上。

   .. attribute:: environ

      底层的 WSGI 环境。

   .. attribute:: method

      当前请求的 HTTP 方法 (``POST`` ， ``GET`` 等等)

   .. attribute:: path
   .. attribute:: script_root
   .. attribute:: url
   .. attribute:: base_url
   .. attribute:: url_root

      提供不同的方式来审视当前的 URL 。想象你的应用监听下面的 URL::

          http://www.example.com/myapplication

      并且用户请求下面的 URL::

          http://www.example.com/myapplication/page.html?x=y

      这个情况下，上面提到的属性的值会为如下:

      ============= ======================================================
      `path`        ``/page.html``
      `script_root` ``/myapplication``
      `base_url`    ``http://www.example.com/myapplication/page.html``
      `url`         ``http://www.example.com/myapplication/page.html?x=y``
      `url_root`    ``http://www.example.com/myapplication/``
      ============= ======================================================

   .. attribute:: is_xhr

      当请求由 JavaScript 的 `XMLHttpRequest` 触发时，该值为 `True` 。
      这只对支持 ``X-Requested-With`` 标头并把该标头设置为
      `XMLHttpRequest` 的库奏效。这么做的库有 prototype 、 jQuery 以及
      Mochikit 等更多。

.. class:: request

   你可以使用全局 `request` 对象访问进入的请求数据。 Flask 处理进入的请求
   数据并允许你用这个全局对象访问它。如果你工作在多线程环境，Flask 内部保证
   你总会在当前线程上获取正确的数据，

   这是一个代理。详情见 :ref:`notes-on-proxies` 。

   请求对象是一个 :class:`~werkzeug.wrappers.Request` 子类的实例，提供所有
   Werkzeug 定义的属性。这里只对最重要的展示了简要概述。


响应对象
----------------

.. autoclass:: flask.Response
   :members: set_cookie, data, mimetype

   .. attribute:: headers

      :class:`Headers` 对象表示响应的标头。

   .. attribute:: status

      字符串表示的响应状态。

   .. attribute:: status_code

      整数表示的响应状态。


会话
--------

如果你设置了 :attr:`Flask.secret_key` ，你可以在 Flask 应用中使用会话。会话
主要使得在请求见保留信息成为可能。 Flask 的实现方法是使用一个签名的 cookie 。
这样，用户可以查看会话的内容，但是不能修改它，除非用户知道密钥。所以确保密钥
被设置为一个复杂且无法被容易猜测的值。

你可以使用 :class:`session` 对象来访问当前的会话:

.. class:: session

   会话对象很像通常的字典，区别是会话对象会追踪修改。

   这是一个代理。更多信息见 :ref:`notes-on-proxies` 。

   下列属性是需要关注的:

   .. attribute:: new

      如果会话是新的，该值为 `True` ，否则为 `False` 。

   .. attribute:: modified

      当果会话对象检测到修改，这个值为 `True` 。注意可变结构的修改不会
      被自动捕获，这种情况下你需要自行显式地设置这个属性为 `True` 。这
      里有 一个例子::

          # this change is not picked up because a mutable object (here
          # a list) is changed.
          session['objects'].append(42)
          # so mark it as modified yourself
          session.modified = True

   .. attribute:: permanent

      如果设为 `True` ，会话存活
      :attr:`~flask.Flask.permanent_session_lifetime` 秒。默认为 31 天。
      如果是 `False` （默认选项），会话会在用户关闭浏览器时删除。

会话接口
-----------------

.. versionadded:: 0.8

会话接口提供了简单的途径来替换 Flask 正在使用的会话实现。

.. currentmodule:: flask.sessions

.. autoclass:: SessionInterface
   :members:

.. autoclass:: SecureCookieSessionInterface
   :members:

.. autoclass:: NullSession
   :members:

.. autoclass:: SessionMixin
   :members:

.. autoclass:: session_json_serializer

   这个对象提供了和simplejson类似的序列化(dump)和反序列化(load)方法，但它
   还添饰了一些常出现在会话中的python内置对象。目前支持转储的JSON的拓展值
   如下：

   -    :class:`~markupsafe.Markup` objects
   -    :class:`~uuid.UUID` objects
   -    :class:`~datetime.datetime` objects
   -   :class:`tuple`\s

.. admonition:: Notice

   ``PERMANENT_SESSION_LIFETIME`` 配置键从 Flask 0.8 开始可以是一个整数。
   你可以自己计算值，或用应用上的
   :attr:`~flask.Flask.permanent_session_lifetime` 属性来自动转换结果为
   一个整数。


测试客户端
-----------

.. currentmodule:: flask.testing

.. autoclass:: FlaskClient
   :members:


应用全局变量
-------------------

.. currentmodule:: flask

只在一个请求内，从一个函数到另一个函数共享数据，全局变量并不够好。因为这
在线程环境下行不通。 Flask 提供了一个特殊的对象来确保只在活动的请求中
有效，并且每个请求都返回不同的值。一言蔽之：它做正确的事情，如同它对
:class:`request` 和 :class:`session` 做的那样。

.. data:: g

   在这上存储你任何你想要存储的。例如一个数据库连接或者当前登入的用户。

   从 Flask 0.10 起，对象 g 存储在应用上下文中而不再是请求上下文中，这
   意味着即使在应用上下文中它也是可访问的而不是只能在请求上下文中。在
   结合:ref:`faking-resources`模式使用来测试时这尤为有用。

   另外，在 0.10 中你可以使用 :meth:`get` 方法来获取一个属性或者如果这
   个属性没设置的话将得到 `None` (或者第二个参数)。
   这两种用法现在是没有区别的::
      
      user = getattr(flask.g, 'user', None)
      user = flask.get.get('user', None)
   
   现在也能在 g 对象上使用 ``in`` 运算符来确定它是否有某个属性，并且它
   将使用 `yield` 关键字来生成这样一个可迭代的包含所有keys的生成器。

   这是一个代理。详情见 :ref:`notes-on-proxies` 。


有用的函数和类
----------------------------

.. data:: current_app

   指向正在处理请求的应用。这对于想要支持同时运行多个应用的扩展有用。
   它由应用上下文驱动，而不是请求上下文，所以你可以用
   :meth:`~flask.Flask.app_context` 方法
   修改这个代理的值。

   这是一个代理。详情见 :ref:`notes-on-proxies` 。

.. autofunction:: has_request_context

.. autofunction:: has_app_context

.. autofunction:: url_for

.. function:: abort(code)

   抛出一个给定状态代码的 :exc:`~werkzeug.exceptions.HTTPException` 。
   例如想要用一个页面未找到异常来终止请求，你可以调用 ``abort(404)`` 。

   :param code: the HTTP error code.

.. autofunction:: redirect

.. autofunction:: make_response

.. autofunction:: send_file

.. autofunction:: send_from_directory

.. autofunction:: safe_join

.. autofunction:: escape

.. autoclass:: Markup
   :members: escape, unescape, striptags

消息闪现
----------------

.. autofunction:: flash

.. autofunction:: get_flashed_messages

JSON 支持
--------------

.. module:: flask.json

Flask 使用 ``simplejson`` 来实现JSON。自从 simplejson 既在标准库中提供也在
Flask 的拓展中提供。Flask将首先尝试自带的simplejson，如果失败了就使用标准
库中的json模块。除此之外，为了更容易定制它还会委托访问当前应用的JSON的编码
器和解码器。

所以首先不要这样用：

    try:
        import simplejson as json
    except ImportError:
        import json

你可以这样 ::

    from flask import json

For usage examples, read the :mod:`json` documentation.
关于更多的用法，请阅读标准库中的 :mod:`json` 文档。下面的拓展已经默认被集成
到了标准库中JSON模块里：

1.  ``datetime`` 对象被序列化为 :rfc:`822` 字符串。
2.  任何带有 ``__html__`` 方法(比如 :class:`~flask.Markup`)将在序列化的时候
    调用这个方法然后返回的字符串将会被序列化为字符串。


这个 :func:`~htmlsafe_dumps` 方法也能在 Jinja2 的过滤器中使用，名字为
``|tojson`` 。请注意在 `script` 标签内部的内容将不会被转义，所以如果你想在
 `script` 内部使用的话请确保它是不可用的通过 ``|safe`` 来转义，除非你正在
 使用 Flask 0.10，如下：

.. sourcecode:: html+jinja

    <script type=text/javascript>
        doSomethingWith({{ user.username|tojson|safe }});
    </script>

.. autofunction:: jsonify

.. autofunction:: dumps

.. autofunction:: dump

.. autofunction:: loads

.. autofunction:: load

.. autoclass:: JSONEncoder
   :members:

.. autoclass:: JSONDecoder
   :members:

模板渲染
------------------

.. currentmodule:: flask

.. autofunction:: render_template

.. autofunction:: render_template_string

.. autofunction:: get_template_attribute

配置
-------------

.. autoclass:: Config
   :members:

扩展
----------

.. data:: flask.ext

   这个模块重定向导入模块到 Flask 扩展。它在 0.8 中被加入，作为导入 Flask
   扩展的权威方式，并使得我们在发布扩展时能有更大的灵活性。

   如果你想使用名为 “Flask-Foo” 的扩展，你应按照下述从 :data:`~flask.ext`
   导入::

        from flask.ext import foo

   .. versionadded:: 0.8

流的辅助函数
--------------

.. autofunction:: stream_with_context

有用的内构件
----------------

.. autoclass:: flask.ctx.RequestContext
   :members:

.. data:: _request_ctx_stack

   Flask 中使用的所有的上下文局部对象，都由内部的
   :class:`~werkzeug.local.LocalStack` 实现。这是一个带文档的实例，并且可以
   在扩展和应用的代码中使用，但一般来说是不推荐这样使用的。

   下面的属性在栈的每层上都存在:

   `app`
      活动的 Flask 应用

   `url_adapter`
      用于匹配请求的 URL 适配器

   `request`
      当前的请求对象

   `session`
      当前的会话对象

   `g`
      拥有 :data:`flask.g` 对象上全部属性的对象

   `flashes`
      闪现消息的内部缓存

   用法示例::

      from flask import _request_ctx_stack

      def get_session():
          ctx = _request_ctx_stack.top
          if ctx is not None:
              return ctx.session

.. autoclass:: flask.ctx.AppContext
   :members:

.. data:: _app_ctx_stack

   类似请求上下文，但是只跟应用绑定。主要为扩展提供数据存储。

   .. versionadded:: 0.9

.. autoclass:: flask.blueprints.BlueprintSetupState
   :members:

信号
-------

.. when modifying this list, also update the one in signals.rst

.. versionadded:: 0.6

.. data:: signals_available

   当信号系统可用时为 `True` ，即在 `blinker`_ 已经被安装的情况下。

.. data:: template_rendered

   当一个模板成功渲染的时候，这个信号会发出。这个信号带着一个模板实例
   `template` 和为一个字典的上下文（叫 `context` ）两个参数被调用。

.. data:: request_started

   这个信号在处建立请求上下文之外的任何请求处理开始前发送。因为请求上下文
   这个信号在任何对请求的处理前发送，但是正好是在请求的上下文被建立的时候。
   因为请求上下文已经被约束了，用户可以使用 :class:`~flask.request` 之类的标
   准全局代理访问请求对象。

.. data:: request_finished

   这个信号恰好在请求发送给客户端之前发送。它传递名为 `response` 的将被发送
   的响应。

.. data:: got_request_exception

   这个信号在请求处理中抛出异常时发送。它在标准异常处理生效 *之前* ，甚至是
   在不会处理异常的调试模式下也是如此。这个异常会被将作为一个 `exception`
   传递到用户那。

.. data:: request_tearing_down

   这个信号在请求销毁时发送。它总会被调用，即使发生异常。在这种清况下，造
   成teardown的异常将会通过一个叫 `exc` 的关键字参数传递出来。

   .. versionchanged:: 0.9
      添加了 `exc` 参数

.. data:: appcontext_tearing_down

   这个信号在应用上下文销毁时发送。它总会被调用，即使发生异常。在这种清况
   下，造成teardown的异常将会通过一个叫 `exc` 的关键字参数传递出来。发送
   者是application对象。

.. data:: appcontext_pushed

   当应用上下文被压入栈后会发送这个信号。发送者是application对象

   .. versionadded:: 0.10

.. data:: appcontext_popped

   当应用上下文出栈后会发送这个信号。发送者是application对象。这常常与
   :data:`appcontext_tearing_down` 这个信号一致。

   .. versionadded:: 0.10

.. data:: message_flashed

   This signal is sent when the application is flashing a message.
   The messages is sent as `message` keyword argument and the
   当闪现一个消息时会发送这个信号。消息的内容将以 `message` 关键字参数
   发送，而消息的种类则是 `category` 关键字参数。
   
   .. versionadded:: 0.10

.. currentmodule:: None

.. class:: flask.signals.Namespace

   :class:`blinker.base.Namespace` 的别名，如果 blinker 可用的话。否则，
   是一个发送伪信号的伪造的类。这个类对想提供与 Flask 相同的备用系统的
   Flask扩展有用。

   .. method:: signal(name, doc=None)

      在此命名空间中创建一个新信号，如果 blinker 可用的话。否则返回一个
      带有不做任何事的发送方法，任何操作都会（包括连接）报错为
      :exc:`RuntimeError` 的伪信号。

.. _blinker: http://pypi.python.org/pypi/blinker

基于类的视图
-----------------

.. versionadded:: 0.7

.. currentmodule:: None

.. autoclass:: flask.views.View
   :members:

.. autoclass:: flask.views.MethodView
   :members:

.. _url-route-registrations:

URL 路由注册
-----------------------

在路由系统中定义规则可以的方法可以概括为三种:

1.  使用 :meth:`flask.Flask.route` 装饰器
2.  使用 :meth:`flask.Flask.add_url_rule` 函数
3.  直接访问暴露为 :attr:`flask.Flask.url_map` 的底层的 Werkzeug 路由系统

路由中的变量部分可以用尖括号指定（ ``/user/<username>``）。默认情况下，URL
中的变量部分接受任何不带斜线的字符串，而 ``<converter:name>`` 也可以指定不
同的转换器。

变量部分以关键字参数传递给视图函数。

下面的转换器是可用的:

=========== ==========================================
`string`    接受任何不带斜线的字符串（默认的转换器）
`int`       接受整数
`float`     同 `int` ，但是接受浮点数
`path`      和默认的相似，但也接受斜线
=========== ==========================================

这里是一些例子::

    @app.route('/')
    def index():
        pass

    @app.route('/<username>')
    def show_user(username):
        pass

    @app.route('/post/<int:post_id>')
    def show_post(post_id):
        pass

需要注意的一个重要细节是 Flask 处理结尾斜线的方式。你可以应用下面两个
规则来保证 URL 的唯一:

1. 如果规则以斜线结尾，当用户以不带斜线的形式请求，用户被自动重定向到
   带有结尾斜线的相同页面。
2. 如果规则结尾没有斜线，当用户以带斜线的形式请求，会抛出一个 404 not
   found 。

这与 web 服务器处理静态文件的方式一致。这使得安全地使用相对链接地址成为
可能。

你可以为同一个函数定义多个规则。无论如何，他们也要唯一。也可以给定默认值。
这里给出一个接受可选页面的 URL 定义::

    @app.route('/users/', defaults={'page': 1})
    @app.route('/users/page/<int:page>')
    def show_users(page):
        pass

这指定了 ``/users/`` 为第一页的 URL ，``/users/page/N`` 为第 `N` 页的 URL 。

以下是 :meth:`~flask.Flask.route` 和 :meth:`~flask.Flask.add_url_rule`
接受的参数。两者唯一的区别是，带有路由参数的视图函数用装饰器定义，而不是
`view_func` 参数。

=============== ==========================================================
`rule`          URL 规则的字符串
`endpoint`      注册的 URL 规则的末端。如果没有显式地规定，Flask 本身假设
                末端的名称是视图函数的名称，。
`view_func`     当请求呈递到给定的末端时调用的函数。如果没有提供，可以
                在用在 :attr:`~flask.Flask.view_functions` 字典中以末端
                作为键名存储，来在之后设定函数。
`defaults`      规则默认值的字典。上面的示例介绍了默认值如何工作。
`subdomain`     当使用子域名匹配的时候，为子域名设定规则。如果没有给定，假
                定为默认的子域名。
`**options`     这些选项会被推送给底层的 :class:`~werkzeug.routing.Rule`
                对象。一个 Werkzeug 的变化是 method 选项的处理。methods是
                这个规则被限定的方法列表（ `GET` ， `POST` 等等）。默认情
                况下，规则只监听 `GET` （也隐式地监听 `HEAD` ）。从 Flask
                0.6 开始，`OPTIONS` 也被隐式地加入，并且做标准的请求处理。
                它们需要作为关键字参数来给定。
=============== ==========================================================

.. _view-func-options:

视图函数选项
---------------------

对内部使用，视图函数可以有一些属性，附加到视图函数通常没有控制权的自定义的
行为。下面的可选属性覆盖 :meth:`~flask.Flask.add_url_rule` 的默认值或一般
行为:

-   `__name__`: 函数的名称默认用于末端。如果显式地提供末端，这个值会使用。
    此外，它默认以蓝图的名称作为前缀，并且不能从函数本身自定义。
-   `methods`: 如果没有在添加 URL 规则时提供 methods 参数。 Flask 会在视
    图函数对象上寻找是否存在 `methods` 属性。如果存在，它会从上面拉取方法
    的信息。
-   `provide_automatic_options`: 如果设置了这个属性， Flask 会强制禁用或
    启用 HTTP `OPTIONS` 响应的自动实现。这对于对单个视图自定义 `OPTIONS`
    响应而使用装饰器的情况下是有用的。

-   `required_methods`: 如果这个属性被设置了， 当注册一个 URL 规则的时候，
    Flask 将总是会添加这些 methods 即使 methods 参数在 ``route()`` 调用
    的时候被显示的覆盖了。

完整的例子::

    def index():
        if request.method == 'OPTIONS':
            # custom options handling here
            ...
        return 'Hello World!'
    index.provide_automatic_options = False
    index.methods = ['GET', 'OPTIONS']

    app.add_url_rule('/', index)

.. versionadded:: 0.8
   加入了 `provide_automatic_options` 功能。
