.. _quickstart:

快速入门
==========

迫不及待要开始了吗？本页提供了一个很好的 Flask 介绍，并假定你已经安
装好了 Flask。如果没有，请跳转到 :ref:`installation` 章节。

.. _a-minimal-application:

一个最小的应用
---------------------

一个最小的 Flask 应用看起来会是这样::

    from flask import Flask
    app = Flask(__name__)

    @app.route('/')
    def hello_world():
        return 'Hello World!'

    if __name__ == '__main__':
        app.run()

把它保存为 `hello.py` （或是类似的），然后用 Python 解释器来运行。
确保你的应用文件名不是 `flask.py` ，因为这将与 Flask 本身冲突。

::

    $ python hello.py
     * Running on http://127.0.0.1:5000/

现在访问 `http://127.0.0.1:5000/ <http://127.0.0.1:5000/>`_ ，你会
看见 Hello World 问候。

那么，这段代码做了什么？

1. 首先，我们导入了 :class:`~flask.Flask` 类。这个类的实例将会是我
   们的 WSGI 应用程序。
2. 接下来，我们创建一个该类的实例，第一个参数是应用模块或者包的名称。
   如果你使用单一的模块（如本例），你应该使用 `__name__` ，因为模块
   的名称将会因其作为单独应用启动还是作为模块导入而有不同（
   也即是 ``'__main__'`` 或实际的导入名）。这是必须的，这样 Flask
   才知道到哪去找模板、静态文件等等。详情见 :class:`~flask.Flask`
   的文档。
3. 然后，我们使用 :meth:`~flask.Flask.route` 装饰器告诉 Flask 什么样
   的URL 能触发我们的函数。
4. 这个函数的名字也在生成 URL 时被特定的函数采用，这个函数返回我们想
   要显示在用户浏览器中的信息。
5. 最后我们用 :meth:`~flask.Flask.run` 函数来让应用运行在本地服务器上。
   其中 ``if __name__ == '__main__':`` 确保服务器只会在该脚本被
   Python 解释器直接执行的时候才会运行，而不是作为模块导入的时候。

欲关闭服务器，按 Ctrl+C。

.. _public-server:

.. admonition:: 外部可访问的服务器

   如果你运行了这个服务器，你会发现它只能从你自己的计算机上访问，网络
   中其它任何的地方都不能访问。在调试模式下，用户可以在你的计算机上执
   行任意 Python 代码。因此，这个行为是默认的。

   如果你禁用了 `debug` 或信任你所在网络的用户，你可以简单修改调用
   :meth:`~flask.Flask.run` 的方法使你的服务器公开可用，如下::

       app.run(host='0.0.0.0')
	
   这会让操作系统监听所有公网 IP。


.. _debug-mode:

调试模式
----------

虽然 :meth:`~flask.Flask.run` 方法适用于启动本地的开发服务器，但是
你每次修改代码后都要手动重启它。这样并不够优雅，而且 Flask 可以做到更
好。如果你启用了调试支持，服务器会在代码修改后自动重新载入，并在发生
错误时提供一个相当有用的调试器。

有两种途径来启用调试模式。一种是直接在应用对象上设置::

    app.debug = True
    app.run()

另一种是作为 run 方法的一个参数传入::

    app.run(debug=True)

两种方法的效果完全相同。

.. admonition:: 注意

   尽管交互式调试器在允许 fork 的环境中无法正常使用（也即在生产服务器
   上正常使用几乎是不可能的），但它依然允许执行任意代码。这使它成为一
   个巨大的安全隐患，因此它 **绝对不能用于生产环境** 。

运行中的调试器截图：

.. image:: _static/debugger.png
   :align: center
   :class: screenshot
   :alt: screenshot of debugger in action

想用其它的调试器？ 参见 :ref:`working-with-debuggers` 。

.. _routing:

路由
-------

现代 Web 应用的 URL 十分优雅，易于人们辨识记忆，这一点对于那些面向使
用低速网络连接移动设备访问的应用特别有用。如果可以不访问索引页，而是
直接访问想要的那个页面，他们多半会笑逐颜开而再度光顾。

如上所见， :meth:`~flask.Flask.route` 装饰器把一个函数绑定到对应的
URL 上。

这里是一些基本的例子::

    @app.route('/')
    def index():
        return 'Index Page'

    @app.route('/hello')
    def hello():
        return 'Hello World'

但是，不仅如此！你可以构造含有动态部分的 URL，也可以在一个函数上附着
多个规则。

.. _variable-rules:

变量规则
``````````````

要给 URL 添加变量部分，你可以把这些特殊的字段标记为 ``<variable_name>`` ，
这个部分将会作为命名参数传递到你的函数。规则可以用
``<converter:variable_name>`` 指定一个可选的转换器。这里有一些不错的例子::

    @app.route('/user/<username>')
    def show_user_profile(username):
        # show the user profile for that user
        return 'User %s' % username

    @app.route('/post/<int:post_id>')
    def show_post(post_id):
        # show the post with the given id, the id is an integer
        return 'Post %d' % post_id

转换器有下面几种：

=========== ===========================================
`int`       接受整数
`float`     同 `int` ，但是接受浮点数
`path`      和默认的相似，但也接受斜线
=========== ===========================================

.. admonition:: 唯一 URL / 重定向行为

   Flask 的 URL 规则基于 Werkzeug 的路由模块。这个模块背后的思想是基
   于 Apache 以及更早的 HTTP 服务器主张的先例，保证优雅且唯一的 URL。

   以这两个规则为例::

        @app.route('/projects/')
        def projects():
            return 'The project page'

        @app.route('/about')
        def about():
            return 'The about page'

   虽然它们看起来着实相似，但它们结尾斜线的使用在 URL *定义* 中不同。
   第一种情况中，指向 `projects` 的规范 URL 尾端有一个斜线。这种感觉
   很像在文件系统中的文件夹。访问一个结尾不带斜线的 URL 会被
   Flask 重定向到带斜线的规范 URL 去。

   然而，第二种情况的 URL 结尾不带斜线，类似 UNIX-like 系统下的文件的
   路径名。访问结尾带斜线的 URL 会产生一个 404 "Not Found" 错误。

   这个行为使得在遗忘尾斜线时，允许关联的 URL 接任工作，与 Apache 和其它的服务器的行为并无二异。此外，也保证了 URL 的唯一，有助于
   避免搜索引擎索引同一个页面两次。

.. _url-building:

构造 URL
````````````

如果 Flask 能匹配 URL，那么 Flask 可以生成它们吗？当然可以。你可以用
:func:`~flask.url_for` 来给指定的函数构造 URL。它接受函数名作为第一个
参数，也接受对应 URL 规则的变量部分的命名参数。未知变量部分会添加到
URL 末尾作为查询参数。这里有一些例子:

>>> from flask import Flask, url_for
>>> app = Flask(__name__)
>>> @app.route('/')
... def index(): pass
... 
>>> @app.route('/login')
... def login(): pass
... 
>>> @app.route('/user/<username>')
... def profile(username): pass
... 
>>> with app.test_request_context():
...  print url_for('index')
...  print url_for('login')
...  print url_for('login', next='/')
...  print url_for('profile', username='John Doe')
... 
/
/login
/login?next=/
/user/John%20Doe

（这里也用到了 :meth:`~flask.Flask.test_request_context` 方法，下面会
解释。即使我们正在通过 Python 的 shell 进行交互，它依然会告诉 Flask 要
表现为正在处理一个请求。请看下面的解释。 :ref:`context-locals` ）

为什么你要构建 URL 而非在模板中硬编码？这里有三个绝妙的理由：

1. 反向构建通常比硬编码的描述性更好。更重要的是，它允许你一次性修改 URL，
   而不是到处边找边改。
2. URL 构建会转义特殊字符和 Unicode 数据，免去你很多麻烦。
3. 如果你的应用不位于 URL 的根路径（比如，在 ``/myapplication`` 下，而不
   是 ``/`` ）， :func:`~flask.url_for` 会妥善处理这个问题。

.. _http-methods:

HTTP 方法
````````````
HTTP （与 Web 应用会话的协议）有许多不同的访问 URL 方法。默认情况下，路
由只回应 `GET` 请求，但是通过 :meth:`~flask.Flask.route` 装饰器传递
`methods` 参数可以改变这个行为。这里有一些例子::

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            do_the_login()
        else:
            show_the_login_form()

如果存在 `GET` ，那么也会替你自动地添加 `HEAD`，无需干预。它会确保
遵照 `HTTP RFC`_ （描述 HTTP 协议的文档）处理 `HEAD` 请求，所以你可以
完全忽略这部分的 HTTP 规范。同样，自从 Flask 0.6 起， 也实现了
`OPTIONS` 的自动处理。

你不知道一个 HTTP 方法是什么？不必担心，这里会简要介绍 HTTP 方法和它们
为什么重要：

HTTP 方法（也经常被叫做“谓词”）告知服务器，客户端想对请求的页面 *做*
些什么。下面的都是非常常见的方法：

`GET`
    浏览器告知服务器：只 *获取* 页面上的信息并发给我。这是最常用的方法。

`HEAD`
    浏览器告诉服务器：欲获取信息，但是只关心 *消息头* 。应用应像处理
    `GET` 请求一样来处理它，但是不分发实际内容。在 Flask 中你完全无需
    人工    干预，底层的 Werkzeug 库已经替你打点好了。

`POST`
    浏览器告诉服务器：想在 URL 上 *发布* 新信息。并且，服务器必须确保
    数据已存储且仅存储一次。这是 HTML 表单通常发送数据到服务器的方法。

`PUT`
    类似 `POST` 但是服务器可能触发了存储过程多次，多次覆盖掉旧值。你可
    能会问这有什么用，当然这是有原因的。考虑到传输中连接可能会丢失，在
    这种    情况下浏览器和服务器之间的系统可能安全地第二次接收请求，而
    不破坏其它东西。因为 `POST` 它只触发一次，所以用 `POST` 是不可能的。

`DELETE`
    删除给定位置的信息。

`OPTIONS`
    给客户端提供一个敏捷的途径来弄清这个 URL 支持哪些 HTTP 方法。
    从 Flask 0.6 开始，实现了自动处理。

有趣的是，在 HTML4 和 XHTML1 中，表单只能以 `GET` 和 `POST` 方法提交到
服务器。但是 JavaScript 和未来的 HTML 标准允许你使用其它所有的方法。此
外，HTTP 最近变得相当流行，浏览器不再是唯一的 HTTP 客户端。比如，许多版
本控制系统就在使用 HTTP。

.. _HTTP RFC: http://www.ietf.org/rfc/rfc2068.txt

.._static-files:

静态文件
------------

动态 web 应用也会需要静态文件，通常是 CSS 和 JavaScript 文件。理想状况下，
你已经配置好 Web 服务器来提供静态文件，但是在开发中，Flask 也可以做到。
只要在你的包中或是模块的所在目录中创建一个名为 `static` 的文件夹，在应用
中使用 `/static` 即可访问。

给静态文件生成 URL ，使用特殊的 ``'static'`` 端点名::

    url_for('static', filename='style.css')

这个文件应该存储在文件系统上的 ``static/style.css`` 。

.. rendering-templates:

模板渲染
-------------------

用 Python 生成 HTML 十分无趣，而且相当繁琐，因为你必须手动对 HTML 做转
义来保证应用的安全。为此，Flask 配备了
`Jinja2 <http://jinja.pocoo.org/2/>`_ 模板引擎。

你可以使用 :func:`~flask.render_template` 方法来渲染模板。你需要做的一
切就是将模板名和你想作为关键字的参数传入模板的变量。这里有一个展示如何
渲染模板的简例::

    from flask import render_template

    @app.route('/hello/')
    @app.route('/hello/<name>')
    def hello(name=None):
        return render_template('hello.html', name=name)

Flask 会在 `templates` 文件夹里寻找模板。所以，如果你的应用是个模块，这
个文件夹应该与模块同级；如果它是一个包，那么这个文件夹作为包的子目录:

**情况 1**: 模块::

    /application.py
    /templates
        /hello.html

**情况 2**: 包::

    /application
        /__init__.py
        /templates
            /hello.html

关于模板，你可以发挥 Jinja2 模板的全部实例。更多信息请见
`Jinja2 模板文档
<http://docs.jinkan.org/docs/jinja2>`_ 。

这里有一个模板实例：

.. sourcecode:: html+jinja

    <!doctype html>
    <title>Hello from Flask</title>
    {% if name %}
      <h1>Hello {{ name }}!</h1>
    {% else %}
      <h1>Hello World!</h1>
    {% endif %}

在模板里，你也可以访问 :class:`~flask.request` 、
:class:`~flask.session` 和 :class:`~flask.g` [#]_ 对象，
以及 :func:`~flask.get_flashed_messages` 函数。

模板继承让模板用起来相当顺手。如欲了解继承的工作机理，请跳转到
:ref:`template-inheritance` 模式的文档。最起码，模板继承能使特定元素
（比如页眉、导航栏和页脚）可以出现在所有的页面。

自动转义功能默认是开启的，所以如果 `name` 包含 HTML ，它将会被自动转
义。如果你能信任一个变量，并且你知道它是安全的（例如一个模块把 Wiki 标
记转换为 HTML），你可以用 :class:`~jinja2.Markup` 类或 ``|safe`` 过滤
器在模板中把它标记为安全的。在 Jinja 2 文档中，你会看到更多的例子。

这里是一个 :class:`~jinja2.Markup` 类如何使用的简单介绍:

>>> from flask import Markup
>>> Markup('<strong>Hello %s!</strong>') % '<blink>hacker</blink>'
Markup(u'<strong>Hello &lt;blink&gt;hacker&lt;/blink&gt;!</strong>')
>>> Markup.escape('<blink>hacker</blink>')
Markup(u'&lt;blink&gt;hacker&lt;/blink&gt;')
>>> Markup('<em>Marked up</em> &raquo; HTML').striptags()
u'Marked up \xbb HTML'

.. versionchanged:: 0.5
   自动转义不再在所有模板中启用。下列扩展名的模板会触发自动转义：
   ``.html`` 、 ``.htm`` 、``.xml`` 、 ``.xhtml`` 。从字符串加载
   的模板会禁用自动转义。

.. [#] 不确定 :class:`~flask.g` 对象是什么？它允许你按需存储信息，
   查看（ :class:`~flask.g` ）对象的文档和 :ref:`sqlite3` 的文
   档以获取更多信息。

.. _accessing-request-data:

访问请求数据
----------------------

对于 Web 应用，与客户端发送给服务器的数据交互至关重要。在 Flask 中
由全局的 :class:`~flask.request` 对象来提供这些信息。如果你有一定的
Python 经验，你会好奇，为什么这个对象是全局的，为什么 Flask 还能保证
线程安全。答案是环境作用域：

.. _context-locals:

环境局部变量
``````````````

.. admonition:: 内幕

   如果你想理解其工作机制及如何利用环境局部变量实现自动化测试，请阅
   读此节，否则可跳过。

Flask 中的某些对象是全局对象，但却不是通常的那种。这些对象实际上是特定
环境的局部对象的代理。虽然很拗口，但实际上很容易理解。

想象一下处理线程的环境。一个请求传入，Web 服务器决定生成一个新线程（
或者别的什么东西，只要这个底层的对象可以胜任并发系统，而不仅仅是线程）。
当 Flask 开始它内部的请求处理时，它认定当前线程是活动的环境，并绑定当
前的应用和 WSGI 环境到那个环境上（线程）。它的实现很巧妙，能保证一个应
用调用另一个应用时不会出现问题。

所以，这对你来说意味着什么？除非你要做类似单元测试的东西，否则你基本上
可以完全无视它。你会发现依赖于一段请求对象的代码，因没有请求对象无法正
常运行。解决方案是，自行创建一个请求对象并且把它绑定到环境中。单元测试
的最简单的解决方案是：用 :meth:`~flask.Flask.test_request_context` 环
境管理器。结合 `with` 声明，绑定一个测试请求，这样你才能与之交互。下面
是一个例子::

    from flask import request

    with app.test_request_context('/hello', method='POST'):
        # now you can do something with the request until the
        # end of the with block, such as basic assertions:
        assert request.path == '/hello'
        assert request.method == 'POST'

另一种可能是：传递整个 WSGI 环境给
:meth:`~flask.Flask.request_context` 方法::

    from flask import request

    with app.request_context(environ):
        assert request.method == 'POST'

.. _the-request-object:

请求对象
``````````````````

API 章节对请求对象作了详尽阐述（参见 :class:`~flask.request` ），因此这
里不会赘述。此处宽泛介绍一些最常用的操作。首先从 `flask` 模块里导入它::

    from flask import request

当前请求的 HTTP 方法可通过 :attr:`~flask.request.method` 属性来访问。通
过:attr:`~flask.request.form` 属性来访问表单数据（ `POST` 或 `PUT` 请求
提交的数据）。这里有一个用到上面提到的那两个属性的完整实例::

    @app.route('/login', methods=['POST', 'GET'])
    def login():
        error = None
        if request.method == 'POST':
            if valid_login(request.form['username'],
                           request.form['password']):
                return log_the_user_in(request.form['username'])
            else:
                error = 'Invalid username/password'
        # the code below is executed if the request method
        # was GET or the credentials were invalid
        return render_template('login.html', error=error)

当访问 `form` 属性中的不存在的键会发生什么？会抛出一个特殊的
:exc:`KeyError` 异常。你可以像捕获标准的 :exc:`KeyError` 一样来捕获它。
如果你不这么做，它会显示一个 HTTP 400 Bad Request 错误页面。所以，多数
情况下你并不需要干预这个行为。

你可以通过 :attr:`~flask.request.args` 属性来访问 URL 中提交的参数
（ ``?key=value`` ）::

    searchword = request.args.get('q', '')

我们推荐用 `get` 来访问 URL 参数或捕获 `KeyError` ，因为用户可能会修
改 URL，向他们展现一个 400 bad request 页面会影响用户体验。

欲获取请求对象的完整方法和属性清单，请参阅 :class:`~flask.request` 的
文档。

.. _file-uploads:

文件上传
````````````

用 Flask 处理文件上传很简单。只要确保你没忘记在 HTML 表单中设置
``enctype="multipart/form-data"`` 属性，不然你的浏览器根本不会发送文件。

已上传的文件存储在内存或是文件系统中一个临时的位置。你可以通过请求对象
的 :attr:`~flask.request.files` 属性访问它们。每个上传的文件都会存储在
这个字典里。它表现近乎为一个标准的 Python :class:`file` 对象，但它还有
一个 :meth:`~werkzeug.datastructures.FileStorage.save` 方法，这个方法
允许你把文件保存到服务器的文件系统上。这里是一个用它保存文件的例子::

    from flask import request

    @app.route('/upload', methods=['GET', 'POST'])
    def upload_file():
        if request.method == 'POST':
            f = request.files['the_file']
            f.save('/var/www/uploads/uploaded_file.txt')
        ...

如果你想知道上传前文件在客户端的文件名是什么，你可以访问
:attr:`~werkzeug.datastructures.FileStorage.filename` 属性。但请记住，
永远不要信任这个值，这个值是可以伪造的。如果你要把文件按客户端提供的
文件名存储在服务器上，那么请把它传递给 Werkzeug 提供的
:func:`~werkzeug.utils.secure_filename` 函数::

    from flask import request
    from werkzeug import secure_filename

    @app.route('/upload', methods=['GET', 'POST'])
    def upload_file():
        if request.method == 'POST':
            f = request.files['the_file']
            f.save('/var/www/uploads/' + secure_filename(f.filename))
        ...

一些更好的例子，见 :ref:`uploading-files` 模式。

.. _cookies:

Cookies
```````

你可以通过 :attr:`~flask.Request.cookies` 属性来访问 Cookies，用
响应对象的 :attr:`~flask.Response.set_cookie` 方法来设置 Cookies。请
求对象的 :attr:`~flask.Request.cookies` 属性是一个内容为客户端提交的
所有 Cookies 的字典。如果你想使用会话，请不要直接使用 Cookies，请参
考 :ref:`sessions` 一节。在 Flask 中，已经注意处理了一些 Cookies 安全
细节。

读取 cookies::

    from flask import request

    @app.route('/')
    def index():
        username = request.cookies.get('username')
        # use cookies.get(key) instead of cookies[key] to not get a
        # KeyError if the cookie is missing.

存储 cookies::

    from flask import make_response

    @app.route('/')
    def index():
        resp = make_response(render_template(...))
        resp.set_cookie('username', 'the username')
        return resp

可注意到的是，Cookies 是设置在响应对象上的。由于通常视图函数只是返
回字符串，之后 Flask 将字符串转换为响应对象。如果你要显式地转换，你
可以使用 :meth:`~flask.make_response` 函数然后再进行修改。

有时候你想设置 Cookie，但响应对象不能醋在。这可以利用
:ref:`deferred-callbacks` 模式实现。

为此，也可以阅读 :ref:`about-responses` 。

.. _redirects-and-errors:

重定向和错误
--------------------

你可以用 :func:`~flask.redirect` 函数把用户重定向到其它地方。放弃请
求并返回错误代码，用 :func:`~flask.abort` 函数。这里是一个它们如何
使用的例子::

    from flask import abort, redirect, url_for

    @app.route('/')
    def index():
        return redirect(url_for('login'))

    @app.route('/login')
    def login():
        abort(401)
        this_is_never_executed()

这是一个相当无意义的例子因为用户会从主页重定向到一个不能访问的页面
（401 意味着禁止访问），但是它展示了重定向是如何工作的。

默认情况下，错误代码会显示一个黑白的错误页面。如果你要定制错误页面，
可以使用 :meth:`~flask.Flask.errorhandler` 装饰器::

    from flask import render_template

    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('page_not_found.html'), 404

注意 :func:`~flask.render_template` 调用之后的 ``404`` 。这告诉
Flask，该页的错误代码是 404 ，即没有找到。默认为 200，也就是一切
正常。

.. _about-responses:

关于响应
---------------

视图函数的返回值会被自动转换为一个响应对象。如果返回值是一个字符串，
它被转换为该字符串为主体的、状态码为 ``200 OK``的 、 MIME 类型是
``text/html`` 的响应对象。Flask 把返回值转换为响应对象的逻辑是这样：

1.  如果返回的是一个合法的响应对象，它会从视图直接返回。
2.  如果返回的是一个字符串，响应对象会用字符串数据和默认参数创建。
3.  如果返回的是一个元组，且元组中的元素可以提供额外的信息。这样的
    元组必须是 ``(response, status, headers)`` 的形式，且至少包含一
    个元素。 `status` 值会覆盖状态代码， `headers` 可以是一个列表或
    字典，作为额外的消息标头值。
4.  如果上述条件均不满足， Flask 会假设返回值是一个合法的 WSGI 应用
    程序，并转换为一个请求对象。

如果你想在视图里操纵上述步骤结果的响应对象，可以使用
:func:`~flask.make_response` 函数。

譬如你有这样一个视图:

.. sourcecode:: python

    @app.errorhandler(404)
    def not_found(error):
        return render_template('error.html'), 404

你只需要把返回值表达式传递给 :func:`~flask.make_response` ，获取结
果对象并修改，然后再返回它:

.. sourcecode:: python

    @app.errorhandler(404)
    def not_found(error):
        resp = make_response(render_template('error.html'), 404)
        resp.headers['X-Something'] = 'A value'
        return resp

.. _sessions:

会话
--------

除请求对象之外，还有一个 :class:`~flask.session` 对象。它允许你在不
同请求间存储特定用户的信息。它是在 Cookies 的基础上实现的，并且对
Cookies 进行密钥签名。这意味着用户可以查看你 Cookie 的内容，但却不
能修改它，除非用户知道签名的密钥。

要使用会话，你需要设置一个密钥。这里介绍会话如何工作::

    from flask import Flask, session, redirect, url_for, escape, request

    app = Flask(__name__)

    @app.route('/')
    def index():
        if 'username' in session:
            return 'Logged in as %s' % escape(session['username'])
        return 'You are not logged in'

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            session['username'] = request.form['username']
            return redirect(url_for('index'))
        return '''
            <form action="" method="post">
                <p><input type=text name=username>
                <p><input type=submit value=Login>
            </form>
        '''

    @app.route('/logout')
    def logout():
        # remove the username from the session if it's there
        session.pop('username', None)
        return redirect(url_for('index'))

    # set the secret key.  keep this really secret:
    app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

这里提到的 :func:`~flask.escape` 可以在你模板引擎外做转义（如同本例）。

.. admonition:: 如何生成强壮的密钥

   随机的问题在于很难判断什么是真随机。一个密钥应该足够随机。你的操作
   系统可以基于一个密钥随机生成器来生成漂亮的随机值，这个值可以用来做
   密钥:

   >>> import os
   >>> os.urandom(24)
   '\xfd{H\xe5<\x95\xf9\xe3\x96.5\xd1\x01O<!\xd5\xa2\xa0\x9fR"\xa1\xa8'

   把这个值复制粘贴进你的代码中，你就有了密钥。

使用基于 cookie 的会话需注意: Flask 会将你放进会话对象的值序列化至
Cookies。如果你发现某些值在请求之间并没有持久存在，然而确实已经启用了
Cookies，但也没有得到明确的错误信息。这时，请检查你的页面响应中的
Cookies 的大小，并与 Web 浏览器所支持的大小对比。


.. message-flashing:

消息闪现
----------------

反馈，是良好的应用和用户界面的重要构成。如果用户得不到足够的反馈，他们
很可能开始厌恶这个应用。 Flask 提供了消息闪现系统，可以简单地给用户反馈。
消息闪现系统通常会在请求结束时记录信息，并在下一个（且仅在下一个）请求
中访问记录的信息。展现这些消息通常结合要模板布局。

使用 :func:`~flask.flash` 方法可以闪现一条消息。要操作消息本身，请使用
:func:`~flask.get_flashed_messages` 函数，并且在模板中也可以使用。完整
的例子见 :ref:`message-flashing-pattern` 部分。

.. _logging:

日志记录
-------------

.. versionadded:: 0.3

有时候你会处于这样一种境地，你处理的数据本应该是正确的，但实际上不是。
比如，你会有一些向服务器发送请求的客户端代码，但请求显然是畸形的。这可
能是用户篡改了数据，或是客户端代码的粗制滥造。大多数情况下，正常地返回
``400 Bad Request`` 就可以了，但是有时候不能这么做，并且要让代码继续运
行。

你可能依然想要记录下，是什么不对劲。这时日志记录就派上了用场。从
Flask 0.3 开始，Flask 就已经预置了日志系统。

这里有一些调用日志记录的例子::

    app.logger.debug('A value for debugging')
    app.logger.warning('A warning occurred (%d apples)', 42)
    app.logger.error('An error occurred')

附带的 :attr:`~flask.Flask.logger` 是一个标准日志类
:class:`~logging.Logger` ，所以更多信息请查阅 `logging
文档 <http://docs.python.org/library/logging.html>`_ 。

.. _hooking-in-wsgi-middlewares:

整合 WSGI 中间件
---------------------------

如果你想给你的应用添加 WSGI 中间件，你可以封装内部 WSGI 应用。例如若是
你想用 Werkzeug 包中的某个中间件来应付 lighttpd 中的 bugs ，可以这样做::

    from werkzeug.contrib.fixers import LighttpdCGIRootFix
    app.wsgi_app = LighttpdCGIRootFix(app.wsgi_app)

.. _depolying-to-a-web-server:

部署到 Web 服务器
-------------------------

准备好部署你的 Flask 应用了？你可以立即部署到托管平台来圆满完成快速入
门，以下厂商均向小项目提供免费的方案:

- `在 Heroku 上部署 Flask <http://devcenter.heroku.com/articles/python>`_
- `在 dotCloud 上部署 Flask <http://docs.dotcloud.com/services/python/>`_ 
  附 `Flask 的具体说明 <http://flask.pocoo.org/snippets/48/>`_

托管 Flask 应用的其它选择:

- `在 Webfaction 上部署 Flask <http://flask.pocoo.org/snippets/65/>`_
- `在 Google App Engine 上部署 Flask <https://github.com/kamalgill/flask-appengine-template>`_
- `用 Localtunnel 共享你的本地服务器 <http://flask.pocoo.org/snippets/89/>`_

如果你有自己的主机并且想自己托管，参见 :ref:`deployment` 章节。
