.. _quickstart:

快速入门
==========

迫不及待要开始了吗？本页提供了一个很好的 Flask 介绍，并假定你已经安
装好了 Flask。如果没有，请跳转到 :ref:`installation` 章节。


一个最小的应用
---------------------

一个最小的 Flask 应用看起来是这样::

    from flask import Flask
    app = Flask(__name__)

    @app.route('/')
    def hello_world():
        return 'Hello World!'

    if __name__ == '__main__':
        app.run()

把它保存为 `hello.py` （或是类似的），然后用 Python 解释器来运行它
。确保你的应用没有命名为 `flask.py` ，因为这将与 Flask 本身冲突。

::

    $ python hello.py
     * Running on http://127.0.0.1:5000/

现在访问 `http://127.0.0.1:5000/ <http://127.0.0.1:5000/>`_ ，你会
看见你的 hello world 问候。

那么，这段代码做了什么？

1. 首先，我们导入了 :class:`~flask.Flask` 类。这个类的实例将会是我
   们的 WSGI 应用程序。
2. 接下来，我们创建一个该类的实例。第一个参数是应用模块或者包的名称。
   如果你使用单一的模块（如本例），你应该使用 `__name__` ，因为取决于
   如果它以单独应用启动或作为模块导入，名称将会不同（ ``'__main__'`` 
   相对实际的导入名称）。这是必须的，这样Flask 才会知道到哪里去寻找模板、
   静态文件等等。详情参见 :class:`~flask.Flask` 的文档。
3. 然后，我们使用 :meth:`~flask.Flask.route` 装饰器告诉 Flask 哪个
   URL 应该触发我们的函数。
4. 这个函数的名字也用作给特定的函数生成 URL，并且，它返回我们想要显
   示在用户浏览器中的信息。
5. 最后我们用 :meth:`~flask.Flask.run` 函数来让应用运行在本地服务器上。
   其中 ``if __name__ == '__main__':`` 确保服务器只会在该脚本被
   Python 解释器直接执行的时候才会运行，而不是作为模块导入的时候。

要停止服务器，按 Ctrl+C。

.. _public-server:

.. admonition:: 外部可见的服务器

   如果你运行服务器，你会注意到它只能从你自己的计算机上访问，网络中其
   它任何的地方都不能访问。这是因为默认情况下，调试模式，应用中的一个
   用户可以执行你计算机上的任意 Python 代码。

   如果你禁用了 `debug` 或信任你所在网络的用户，你可以简单修改调用
   :meth:`~flask.Flask.run` 的方法使你的服务器公开可用，如下::

       app.run(host='0.0.0.0')
	
   这让你的操作系统去监听所有公开的IP。


.. _debug-mode:

调试模式
----------

虽然 :meth:`~flask.Flask.run` 方法适用于启动一个本地的开发服务器，但是
你每次修改代码后都要手动重启它。这样并不是很好，然而 Flask 可以做得更
好。如果你启用了调试 支持，服务器会在代码变更时自动重新载入，并且如果
发生错误，它会提供一个有用的调试器。

有两种途径来启用调试模式。一种是在应用对象上设置标志位::

    app.debug = True
    app.run()

另一种是作为 run 方法的一个参数传入::

    app.run(debug=True)

两种方法的效果完全相同。

.. admonition:: 注意

   尽管交互式调试器不能在 forking 环境（即在生产服务器上使用几乎是不可
   能的），它依然允许执行任意代码。这使它成为一个巨大的安全风险，因此
   它  **绝对不能用于生产环境** 。

运行中的调试器截图：

.. image:: _static/debugger.png
   :align: center
   :class: screenshot
   :alt: screenshot of debugger in action

想用另一个调试器？ 参见 :ref:`working-with-debuggers` 。


路由
-------

现代 web 应用使用优雅的 URL，这易于人们记住 URL ，这点在面向使用慢网络连
接的移动设备的应用上特别有用。如果用户可以不通过访问索引页而直接访问预
想的页面，他们多半会喜欢这个页面而再度光顾。

如上所见， :meth:`~flask.Flask.route` 装饰器用于把一个函数绑定到一个
URL 上。这里是一些基本的例子::

    @app.route('/')
    def index():
        return 'Index Page'

    @app.route('/hello')
    def hello():
        return 'Hello World'

但是，不仅如此！你可以构造特定部分动态的 URL，也可以在一个函数上附加多
个规则。

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

现有的转换器如下：

=========== ===========================================
`int`       接受整数
`float`     同 `int` ，但是接受浮点数
`path`      和默认的相似，但也接受斜线
=========== ===========================================

.. admonition:: 唯一的网址 / 重定向行为

   Flask 的 URL 规则基于 Werkzeug 的路由模块。这个模块背后的思想是保
   证优雅且唯一的 URL 基于 Apache 和更早的 HTTP 服务器规定的先例。

   以这两个规则为例::

        @app.route('/projects/')
        def projects():
            return 'The project page'

        @app.route('/about')
        def about():
            return 'The about page'

   虽然它们看起来确实相似，但它们结尾斜线的使用在 URL *定义* 中不同。
   第一种情况中，规范的 URL 指向 `projects` 尾端有一个斜线。这种感觉
   很像在文件系统中的文件夹。访问一个结尾不带斜线的 URL 会被
   Flask 重定向到带斜线的规范 URL 去。

   然而，第二种情况的 URL 结尾不带斜线，类似 UNIX-like 系统下的文件的
   路径名。访问结尾带斜线的 URL 会产生一个 404 "Not Found" 错误。

   当用户访问页面时忘记结尾斜线时，这个行为允许关联的 URL 继续工作，并
   且与 Apache 和其它的服务器的行为一致。另外，URL 会保持唯一，有助于
   避免搜索引擎索引同一个页面两次。


.. _url-building:

构建 URL
````````````

如果它能匹配 URL ，那么 Flask 可以生成它们吗？当然可以。你可以使用
:func:`~flask.url_for` 来给一个特定函数构造 URL。它接受一个函数名作
为第一个参数和一些关键字参数，每个对应 URL 规则的变量部分。未知变量部
分会添加到 URL 末尾作为查询参数。这里是一些例子:

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

（这里也用到了 :meth:`~flask.Flask.test_request_context` 方法，下面会解
释。它告诉 Flask 正在处理一个请求，即使我们在通过 Python 的 shell 进行交
互。请看下面的解释。 :ref:`context-locals` ）

为什么你会想要构建 URL 而不是在模板中硬编码？这里有三个好理由：

1. 反向构建通常比硬编码更具备描述性。更重要的是，它允许你一次性修改 URL，
   而不是到处找 URL 改。
2. URL 构建会显式地处理特殊字符和 Unicode 数据的转义，所以你不需要亲自处理。
3. 如果你的应用不位于 URL 的根路径（比如，在 ``/myapplication`` 而不是 ``/``
   ）， :func:`~flask.url_for` 会为你妥善地处理这些。

HTTP 方法
````````````
HTTP （web 应用会话的协议）知道访问 URL 的不同方法。默认情况下，路由只回应
`GET` 请求，但是通过给 :meth:`~flask.Flask.route` 装饰器提供 `methods` 参数
可以更改这个行为。这里有一些例子::

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            do_the_login()
        else:
            show_the_login_form()

如果当前是 `GET` ， `HEAD` 也会自动的为你添加。你不必处理它。它确保 `HEAD`
请求按照 `HTTP RFC`_ （描述 HTTP 协议的文档）来处理，所以你可以完全忽略这部
分的 HTTP 规范。同样，自从 Flask 0.6 起， `OPTIONS` 也实现了自动处理。

你不知道一个 HTTP 方法是什么？不要担心，这里快速介绍 HTTP 方法和它们为什么重
要：

HTTP 方法（也经常被叫做“谓词”）告诉服务器客户端想对请求的页面 *做* 什么。下
列方法非常常见：

`GET`
    浏览器告诉服务器，只 *获取* 页面上的信息并发给我。这是最常用的方法。

`HEAD`
    浏览器告诉服务器获取信息，但是只对 *消息头* 感兴趣。应用期望像 `GET` 请求
    一样处理它，但是不传递实际内容。在 Flask 中你完全不用处理它，底层的
    Werkzeug 库已经替你处理好了。

`POST`
    浏览器告诉服务器，它想在 URL 上 *发布* 新信息。并且，服务器必须确保数据已
    存储且只存储一次。这是 HTML 表单通常发送数据到服务器的方法。

`PUT`
    类似 `POST` 但是服务器可能触发了存储过程多次，多次覆盖掉旧值。你可能会问这
    有什么用，当然这是有原因的。考虑到传输中连接可能会丢失，在这种情况下浏览器
    和服务器之间的系统可能安全地第二次接收请求，而不破坏其它东西。使用 `POST`
    不能实现，因为它只会被触发一次。

`DELETE`
    删除给定位置的信息。

`OPTIONS`
    给客户端提供一个快速的途径来弄清这个 URL 支持哪些 HTTP 方法。从 Flask 0.6 开
    始，自动实现了它。

现在有趣的部分是 HTML4 和 XHTML1，表单只能以 `GET` 和 `POST` 方法来提交到服务器。
但是用 JavaScript 和未来的 HTML 标准你可以使用其它的方法。此外，HTTP 最近变得
相当流行，浏览器不再是唯一的 HTTP 客户端。例如，许多版本控制系统也在用它。

.. _HTTP RFC: http://www.ietf.org/rfc/rfc2068.txt

静态文件
------------

动态 web 应用也会需要静态文件，CSS 和 JavaScript 文件通常来源于此。理想情况下，
你已经配置 web 服务器来提供它们，但是在开发中， Flask 也可以做到。只要在你的包中
或模块旁边创建一个名为 `static` 的文件夹，在应用中使用 `/static` 即可访问。

给静态文件生成 URL ，使用特殊的 ``'static'`` 端点名::

    url_for('static', filename='style.css')

这个文件应该存储在文件系统上的 ``static/style.css`` 。

模板渲染
-------------------

在 Python 里生成 HTML 十分无趣，且其实相当繁琐，因为你需要自行对 HTML 做转
义来保证应用安全。由于这个原因， Flask 自动配置了
`Jinja2 <http://jinja.pocoo.org/2/>`_ 模板引擎。

你可以使用 :func:`~flask.render_template` 方法来渲染模板。所有你需要做的就是提供
模板名和你想作为关键字参数传入模板的变量。这里有一个描述如何渲染模板的简例::

    from flask import render_template

    @app.route('/hello/')
    @app.route('/hello/<name>')
    def hello(name=None):
        return render_template('hello.html', name=name)

Flask 会在 `templates` 文件夹里寻找模板。所以，如果你的应用是个模块，这个文件
夹在模块的旁边；如果它是一个包，那么这个文件夹在你的包里面:

**情况 1**: 一个模块::

    /application.py
    /templates
        /hello.html

**情况 2**: 一个包::

    /application
        /__init__.py
        /templates
            /hello.html

对于模板，你可以使用 Jinja2 模板的全部能力。更多信息请见官方的 `Jinja2 模板文档
<http://jinja.pocoo.org/2/documentation/templates>`_ 。

这里是一个模板实例：

.. sourcecode:: html+jinja

    <!doctype html>
    <title>Hello from Flask</title>
    {% if name %}
      <h1>Hello {{ name }}!</h1>
    {% else %}
      <h1>Hello World!</h1>
    {% endif %}

在模板里，你也可以访问 :class:`~flask.request` 、 :class:`~flask.session` 和
:class:`~flask.g` [#]_ 对象，以及 :func:`~flask.get_flashed_messages` 函数。

使用继承，模板会相当有用。如果你想知道继承如何工作，请跳转到
:ref:`template-inheritance` 模式文档。基本的模板继承使得特定元素（比如页眉、导航
栏和页脚）出现在每一页成为可能。

自动转义是开启的，所以如果 `name` 包含 HTML ，它将会被自动转义。如果你能信任一个
变量，并且你知道它是安全的（例如一个模块把 wiki 标记转换到 HTML ），你可以用
:class:`~jinja2.Markup` 类或 ``|safe`` 过滤器在模板中标记它是安全的。在 Jinja 2
文档中，你会见到更多例子。

这里是一个 :class:`~jinja2.Markup` 类如何工作的基本介绍:

>>> from flask import Markup
>>> Markup('<strong>Hello %s!</strong>') % '<blink>hacker</blink>'
Markup(u'<strong>Hello &lt;blink&gt;hacker&lt;/blink&gt;!</strong>')
>>> Markup.escape('<blink>hacker</blink>')
Markup(u'&lt;blink&gt;hacker&lt;/blink&gt;')
>>> Markup('<em>Marked up</em> &raquo; HTML').striptags()
u'Marked up \xbb HTML'

.. versionchanged:: 0.5
   自动转义不再在所有模板中启用。下列扩展名的模板会触发自动转义： ``.html`` 、
   ``.htm`` 、``.xml`` 、 ``.xhtml`` 。从字符串加载的模板会禁用自动转义。

.. [#] 不确定 :class:`~flask.g` 对象是什么？它是你可以按需存储信息的东西，
   查看（ :class:`~flask.g` ）对象的文档和 :ref:`sqlite3` 的文档以获取更多信息。


访问请求数据
----------------------

对于 web 应用，对客户端发送给服务器的数据做出反应至关重要。在 Flask 中由全局
的 :class:`~flask.request` 对象来提供这些信息。如果你有一定的 Python 经验，你
会好奇这个对象怎么可能是全局的，并且 Flask 是怎么还能保证线程安全。答案是上下
文作用域:

.. _context-locals:

局部上下文
``````````````

.. admonition:: 内幕

   如果你想理解它是如何工作和如何用它实现测试，请阅读此节，否则可跳过。

Flask 中的某些对象是全局对象，但是不是通常的类型。这些对象实际上是给定上下文
的局部对象的代理。虽然很拗口，但实际上很容易理解。

想象一下处理线程的上下文。一个请求传入，web 服务器决定生成一个新线程（或者别
的什么东西，这个基础对象可以胜任并发系统，而不仅仅是线程）。当 Flask 开始它
内部请求处理时，它认定当前线程是活动的上下文并绑定当前的应用和 WSGI 环境到那
个上下文（线程）。它以一种智能的方法来实现，以致一个应用可以调用另一个应用而
不会中断。

所以这对你来说意味着什么？除了你要做类似单元测试的东西，基本上你可以完全忽略
这种情况。你会发现依赖于一个请求对象的代码会突然中断，因为不会有请求对象。解
决方案是自己创建一个请求对象并且把它绑定到上下文。单元测试的最早的解决方案是
使用 :meth:`~flask.Flask.test_request_context` 上下文管理器。结合 `with` 声
明，它将绑定一个测试请求来进行交互。这里是一个例子::

    from flask import request

    with app.test_request_context('/hello', method='POST'):
        # now you can do something with the request until the
        # end of the with block, such as basic assertions:
        assert request.path == '/hello'
        assert request.method == 'POST'

另一种可能是传递整个 WSGI 环境给 :meth:`~flask.Flask.request_context` 方法::

    from flask import request

    with app.request_context(environ):
        assert request.method == 'POST'

请求对象
``````````````````

请求对象在 API 章节有详细的描述（参见 :class:`~flask.request` ），这里不会赘
述。这里宽泛介绍一些最常用的操作。首先你需要从 `flask` 模块里导入它::

    from flask import request

当前的请求方式通过 :attr:`~flask.request.method` 属性来访问。通过
:attr:`~flask.request.form` 属性来访问表单数据（ `POST` 或 `PUT` 请求提交的数
据）。这里有一个上面提到的两个属性的完整实例::

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

当 `form` 属性中的键值不存在会发生什么？在这种情况，一个特殊的
:exc:`KeyError` 异常会抛出。你可以像捕获标准的 :exc:`KeyError` 来捕获它。但如
果你不这么做，会显示一个 HTTP 400 Bad Request 错误页面。所以，很多情况下你不需
要处理这个问题。

你可以通过 :attr:`~flask.request.args` 属性来访问 URL 中提交的参数
（ ``?key=value`` ）::

    searchword = request.args.get('q', '')

我们推荐使用 `get` 来访问 URL 参数或捕获 `KeyError` ，因为用户可能会修改 URL ，
向他们展现一个 400 bad request 页面会影响用户体验。

想获取请求对象的完整方法和属性清单，请参阅 :class:`~flask.request` 的文档。

文件上传
````````````

你可以很容易的用 Flask 处理文件上传。只需要确保没忘记在你的 HTML 表单中设置
``enctype="multipart/form-data"`` 属性，否则你的浏览器将根本不提交文件。

已上传的文件存储在内存或是文件系统上的临时位置。你可以通过请求对象的
:attr:`~flask.request.files` 属性访问那些文件。每个上传的文件都会存储在那个
字典里。它表现得如同一个标准的 Python :class:`file` 对象，但它还有一个
:meth:`~werkzeug.datastructures.FileStorage.save` 方法来允许你在服务器的文件
系统上保存它。这里是一个它如何工作的例子::

    from flask import request

    @app.route('/upload', methods=['GET', 'POST'])
    def upload_file():
        if request.method == 'POST':
            f = request.files['the_file']
            f.save('/var/www/uploads/uploaded_file.txt')
        ...

如果你想知道上传前文件在客户端的文件名，你可以访问
:attr:`~werkzeug.datastructures.FileStorage.filename` 属性。但请记住永远不
要信任这个值，因为这个值可以伪造。如果你想要使用客户端的文件名来在服务器上
存储文件，把它传递给 Werkzeug 提供的
:func:`~werkzeug.utils.secure_filename` 函数::

    from flask import request
    from werkzeug import secure_filename

    @app.route('/upload', methods=['GET', 'POST'])
    def upload_file():
        if request.method == 'POST':
            f = request.files['the_file']
            f.save('/var/www/uploads/' + secure_filename(f.filename))
        ...

一些更好的例子，查看 :ref:`uploading-files` 模式。

Cookies
```````

你可以通过 :attr:`~flask.Request.cookies` 属性来访问 cookies 。设置
cookies 通过响应对象的 :attr:`~flask.Response.set_cookie` 方法。请求对象
的 :attr:`~flask.Request.cookies` 属性是一个客户端提交的所有 cookies 的
字典。如果你想使用会话，请不要直接使用 cookies 而是参考 :ref:`sessions`
一节。在 Flask 中，已经在 cookies 上增加了一些安全细节。

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

注意 cookies 是设置在响应对象上。由于通常只是从视图函数返回字符串，
Flask 会将其转换为响应对象。如果你显式地想要这么做，你可以使用
:meth:`~flask.make_response` 函数然后修改它。

有时候你会想要在响应对象不存在的时候设置 cookie ，这在利用
:ref:`deferred-callbacks` 模式时是可行的。


为此也可以参阅 :ref:`about-responses` 。

重定向和错误
--------------------

重定向用户到其它地方你可以使用 :func:`~flask.redirect` 函数。放弃请求并
返回错误代码可以使用 :func:`~flask.abort` 函数。这里是一个它们如何工作的
例子::

    from flask import abort, redirect, url_for

    @app.route('/')
    def index():
        return redirect(url_for('login'))

    @app.route('/login')
    def login():
        abort(401)
        this_is_never_executed()

这是一个相当无意义的例子因为用户会从主页重定向到一个不能访问的页面（401意
味着禁止访问），但是它说明了重定向如何工作。

默认情况下，每个错误代码会显示一个黑白错误页面。如果你想定制错误页面，可
以使用 :meth:`~flask.Flask.errorhandler` 装饰器::

    from flask import render_template

    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('page_not_found.html'), 404

注意 :func:`~flask.render_template` 调用之后的 ``404`` 。这告诉 Flask 该
页的错误代码应是 404 ，即没有找到。默认的 200 被假定为：一切正常。

.. _about-responses:

关于响应
---------------

一个视图函数的返回值会被自动转换为一个响应对象。如果返回值是一个字符串，
它被转换为响应主体为该字符串、错误代码为 ``200 OK`` 、 MIME 类型为
``text/html`` 的响应对象。Flask 把返回值转换为响应对象的逻辑如下：

1.  如果返回的是一个合法的响应对象，它会被从视图直接返回。
2.  如果返回的是一个字符串，响应对象会用字符串数据和默认参数创建。
3.  如果返回的是一个元组，且元组中的元素可以提供额外的信息。这样的元组
    必须是 ``(response, status, headers)`` 这样的形式，且至少包含一个元素。
    `status` 值会覆盖状态代码， `headers` 可以是一个列表或字典，作为额外的
    消息头值。
4.  如果上述条件均不满足， Flask 会假设返回值是一个合法的 WSGI 应用程序，
    并转换为一个请求对象。

如果你想在视图里掌控上述步骤结果的响应对象，你可以使用
:func:`~flask.make_response` 函数。

想象你有这样一个视图:

.. sourcecode:: python

    @app.errorhandler(404)
    def not_found(error):
        return render_template('error.html'), 404

你只需要用 :func:`~flask.make_response` 封装返回表达式，获取结果对象并修
改，然后返回它:

.. sourcecode:: python

    @app.errorhandler(404)
    def not_found(error):
        resp = make_response(render_template('error.html'), 404)
        resp.headers['X-Something'] = 'A value'
        return resp

.. _sessions:

会话
--------

除请求对象之外，还有 :class:`~flask.session` 对象允许你在不同请求间存储特
定用户的信息。这是在 cookies 的基础上实现的，并且在 cookies 中使用加密的
签名。这意味着用户可以查看你 cookie 的内容，但是不能修改它，除非它知道签
名的密钥。

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

这里提到的 :func:`~flask.escape` 可以在你不使用模板引擎的时候做转义（如同
本例）。

.. admonition:: 如何生成一个强壮的密钥

   随机的问题在于很难判断什么是真随机。一个密钥应该足够随机。你的操作系统
   可以基于一个密码随机生成器来生成漂亮的随机值，这个值可以用来做密钥:

   >>> import os
   >>> os.urandom(24)
   '\xfd{H\xe5<\x95\xf9\xe3\x96.5\xd1\x01O<!\xd5\xa2\xa0\x9fR"\xa1\xa8'

   把这个值复制粘贴到你的代码，你就搞定了密钥。

使用基于 cookie 的会话需注意: Flask 会将你放进会话对象的值序列化到 cookie。
如果你发现某些值在请求之间并没有持久化保存，而 cookies 确实已经启用了，你也没
有得到明确的错误信息，请检查你的页面响应中的 cookie 的大小，并与 web 浏览器所
支持的大小对比。


消息闪现
----------------

良好的应用和用户界面全部涉及反馈。如果用户得不到足够的反馈，他们很可能开始
厌恶这个应用。 Flask 提供一种实在简单的方法来通过消息闪现系统给用户反馈。
消息闪现系统基本上使得在请求结束时记录信息并在下一个（且仅在下一个）请求中
访问。通常结合模板布局来展现消息。

使用 :func:`~flask.flash` 方法可以闪现一条消息。要掌控消息本身，使用
:func:`~flask.get_flashed_messages` 函数，并且在模板中也可以使用。完整的例
子请查阅 :ref:`message-flashing-pattern` 部分。

日志记录
-------------

.. versionadded:: 0.3

有时候你处于一种境地，你处理的数据本应该是正确的，但实际上不是。比如你有一些
客户端代码向服务器发送请求，但请求显然是畸形的。这可能是用户篡改了数据，或
是客户端代码的失败。大多数情况下，正常地返回 ``400 Bad Request`` 就可以了，
但是有时不这么做，并且代码要继续运行。

你可能依然想要记录发生了什么不对劲。这时日志记录就派上了用场。从 Flask 0.3
开始日志记录是预先配置好的。

这里有一些日志调用的例子::

    app.logger.debug('A value for debugging')
    app.logger.warning('A warning occurred (%d apples)', 42)
    app.logger.error('An error occurred')

附带的 :attr:`~flask.Flask.logger` 是一个标准日志类
:class:`~logging.Logger` ，所以更多信息请见 `logging
文档 <http://docs.python.org/library/logging.html>`_ 。

整合 WSGI 中间件
---------------------------

如果你想给你的应用添加 WSGI 中间件，你可以封装内部 WSGI 应用。例如如果你想
使用 Werkzeug 包中的某个中间件来应付 lighttpd 中的 bugs ，你可以这样做::

    from werkzeug.contrib.fixers import LighttpdCGIRootFix
    app.wsgi_app = LighttpdCGIRootFix(app.wsgi_app)

.. _quickstart_deployment:

部署到 Web 服务器
-------------------------

准备好部署你的新 Flask 应用？你可以立即部署到托管平台来圆满完成快速入门，
以下均向小项目提供免费的方案:

- `在 Heroku 上部署 Flask <http://devcenter.heroku.com/articles/python>`_
- `在 dotCloud 上部署 Flask <http://docs.dotcloud.com/services/python/>`_ 
  附 `Flask 的具体说明 <http://flask.pocoo.org/snippets/48/>`_

你可以托管 Flask 应用的其它选择:

- `在 Webfaction 上部署 Flask <http://flask.pocoo.org/snippets/65/>`_
- `在 Google App Engine 上部署 Flask <https://github.com/kamalgill/flask-appengine-template>`_
- `用 Localtunnel 共享你的本地服务器 <http://flask.pocoo.org/snippets/89/>`_

如果你管理你自己的主机并且想要自己运行，参见 :ref:`deployment` 章节。
