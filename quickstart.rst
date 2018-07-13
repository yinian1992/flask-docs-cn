.. _quickstart:

快速入门
==========

跃跃欲试了吗？本页直接介绍 Flask，并假定你已经安装好了 Flask。如果没有，请返回至
:ref:`installation` 章节。

.. _a-minimal-application:

一个最小的应用
---------------------

这样即是一个最小的 Flask 应用::

    from flask import Flask
    app = Flask(__name__)

    @app.route('/')
    def hello_world():
        return 'Hello World!'

    if __name__ == '__main__':
        app.run()

那么，这段代码做了些什么？

1. 首先我们导入了 :class:`~flask.Flask` 类。这个类的实例将作为我们的 WSGI 应用。
2. 接下来，我们创建了这个类的实例。第一个参数是应用所在模块或包的名称。由于在作为应用
   运行与作为模块导入时名称不同（前者是 ``'__main__'`` ，后者是实际导入的名称），如
   果你像上面的例子中一样采用了单文件模块，应该用 ``__name__`` 作为该参数。这个参数是
   必需的，Flask 根据这个参数来寻找模板、静态文件以及其他各种东西。更多详情见
   :class:`~flask.Flask` 类的文档。
3. 然后又通过 :meth:`~flask.Flask.route` 装饰器告诉 Flask，什么样的 URL 会触发我们
   的函数。
4. 使用了一个命名函数，函数名也用于生成该函数的 URL。由这个函数返回我们想要在用户浏览
   器中展示的消息。

把这段保存为类似 :file:`hello.py` 的文件，但不能是 :file:`flask.py` ，因为这会与
Flask 本身冲突。

你可以用 :command:`flask` 命令或 Python 的 ``-m`` 参数配合 Flask 运行这个应用。在
此之前，你需要在终端中导出 ``FLASK_APP`` 变量::

    $ export FLASK_APP=hello.py
    $ flask run
     * Running on http://127.0.0.1:5000/

如果你在 Windows 下，操作环境变量的语法取决于命令行解释器。命令提示符下采用如下命令::

    C:\path\to\app>set FLASK_APP=hello.py

PowerShell 下则为::

    PS C:\path\to\app> $env:FLASK_APP = "hello.py"

或者也可以使用 :command:`python -m flask`::

    $ export FLASK_APP=hello.py
    $ python -m flask run
     * Running on http://127.0.0.1:5000/

这样就会运行起来一个非常简单的内置服务器，足以应付测试工作，但并不适用于生产环境。部署
选项见 :ref:`deployment` 章节。

现在可以访问 `http://127.0.0.1:5000/ <http://127.0.0.1:5000/>`_ ，即可看到你之前
设置的 Hello World 问候语。

.. _public-server:

.. admonition:: 外部可见的服务器

   当你运行这个服务器的时候，你会注意到这个服务器只能从自己的计算机上访问，网络中的其
   他位置都不能访问。这个机制是默认的。因为在调试模式下，应用的用户可以在你的电脑上运
   行任意 Python 代码。

   如果你禁用了调试器或信任你所在网络的用户，只需添加 ``--host=0.0.0.0`` 参数即可让
   你的服务器公开可用::

       flask run --host=0.0.0.0
	
   这会让你的操作系统监听所有公网 IP。

.. _what-to-do-if-the-server-does-not-start:

服务器没有正常运行怎么办？
---------------------------------------

有多种原因可以导致 :command:`python -m flask` 运行失败或提示 :command:`flask` 命
令不存在。首先，你要留意一下报错信息。

.. _old-version-of-flask:

Flask 版本过低
````````````````````

0.11 及更早版本的 Flask 不是通过这种方式启动应用的。也即 :command:`flask` 确实不存
在，:command:`python -m flask` 亦然。如此，你有两个选项：升级到新版的 Flask 或是查
阅 :ref:`server` 章节中关于运行服务器的备选方式的那部分文档。

.. _invalid-import-name:

无效的导入名
```````````````````

``FLASK_APP`` 环境变量的值即是 :command:`flask run` 要导入的模块名称。如果填入了错
误的名称，会在开始运行时报导入错误（如果启用了调试模式，会在访问应用时报错）。并且会
提示你尝试导入了哪些模块以及为什么导入失败。

最常见的原因是敲错字符，或者没有创建 ``app`` 对象。

.. _debug-mode:

调试模式
----------

（只是想要记录错误和栈追踪信息？见 :ref:`application-errors` ）

:command:`flask` 脚本适用于运行本地开发服务器，但你不得在每次修改代码后手动重启它。
Flask 有改进这种不便的方法。只需启用调试模式，服务器就会自动在代码变更后重新加载，并
能在报错时提供一个特别好用的调试器。

若是要启用所有开发特性（包括调试模式在内），需在运行服务器之前导出 ``FLASK_ENV`` 环
境变量，并赋值为 ``development``::

    $ export FLASK_ENV=development
    $ flask run

（如果在 Windows 下，则把 ``export`` 换成 ``set``。）

这将启用下面的行为：

1.  启用调试工具。
2.  启用自动加载机制。
3.  启用 Flask 应用的调试模式。

.. admonition:: 注意

   尽管交互式调试工具在允许 fork 的环境下无法正常使用（也即放弃了在生产环境下使用的可
   能），它也允许执行任意代码。这使得它成为了一个巨大的安全隐患，因此，它 **绝对不能用
   于生产环境** 。


附上调试工具工作照一张:

.. image:: _static/debugger.png
   :align: center
   :class: screenshot
   :alt: screenshot of debugger in action

关于调试工具的更多信息，请见 `Werkzeug 文档`_ 。

.. _Werkzeug 文档: http://werkzeug.pocoo.org/docs/debug/#using-the-debugger

想采用其他调试工具？见 :ref:`working-with-debuggers` 。

.. _routing:

路由
-------

现代 Web 应用会使用有意义的 URL，易于用户辨识记忆，方便用户直接通过 URL 访问页面。有
意义的 URL 会提升用户忠诚度，更愿意做一名回头客。

用 :meth:`~flask.Flask.route` 装饰器绑定函数到对应的 URL 上::

    @app.route('/')
    def index():
        return 'Index Page'

    @app.route('/hello')
    def hello():
        return 'Hello World'


除此之外，还可以构造动态的 URL，或是在一个函数上附着多个 URL 规则。

.. _variable-rules:

变量规则
``````````````

你可以用 ``<variable_name>`` 这样的形式向 URL 添加变量片段。之后会向函数传递以
``<variable_name>`` 命名的参数。另外，也可以用 ``<converter:variable_name>`` 这样
的形式指定参数的类型转换::

    @app.route('/user/<username>')
    def show_user_profile(username):
        # show the user profile for that user
        return 'User %s' % username

    @app.route('/post/<int:post_id>')
    def show_post(post_id):
        # show the post with the given id, the id is an integer
        return 'Post %d' % post_id

    @app.route('/path/<path:subpath>')
    def show_subpath(subpath):
        # show the subpath after /path/
        return 'Subpath %s' % subpath

类型转换：

========== ==========================================
``string`` （默认）接受斜线以外的任何文本
``int``    接受正整数
``float``  接受正浮点数
``path``   与 ``string`` 类似，但可接受斜线
``uuid``   接受 UUID 字符串
========== ==========================================

.. _unique-urls:

唯一的 URL 与自动跳转机制
``````````````````````````````````

下面的两种 URL 规则在结尾斜线的用法有所区别::

    @app.route('/projects/')
    def projects():
        return 'The project page'

    @app.route('/about')
    def about():
        return 'The about page'

``projects`` 端点的标准 URL 以斜线结尾。类似文件系统中的文件夹。如果你访问了不以斜线
结尾的 URL，Flask 会自动跳转到以斜线结尾的标准 URL。

``about`` 端点结尾没有斜线。类似文件的路径名。访问加上结尾斜线的 URL 时会报 404 “未
找到” 错误。这个机制保证了不同资源的 URL 唯一，也避免搜索引擎多次索引相同的页面。

.. _url-building:

构造 URL
````````````

请使用 :func:`~flask.url_for` 函数为特定函数构建 URL。这个函数的第一个参数是函数的
名称，之后可以传递任意个数的关键字参数，每个关键字参数对应一个 URL 规则中的变量部分。
如果是 URL 规则中未定义的变量，则作为查询参数附加到 URL 后面。

为什么要用 :func:`~flask.url_for` 反向解析 URL 而不是在模板中硬编码 URL 呢？

1. 反向解析比硬编码更直观可读。
2. 你可以统一修改 URL，而不是要在每个硬编码处手动修改。
3. URL 构造函数会自动处理特殊字符和 Unicode 数据的转义，这个处理是对用户透明的。
4. URL 构造函数只会生成绝对路径，规避了浏览器中相对路径的不可预期行为。
5. 如果你的应用没有部署在 URL 根下，比如在 ``/myapplication`` 下，而不是 ``/`` ，
   :func:`~flask.url_for` 会替你妥善处理好这个问题。

举个例子，这里我们用到了 :meth:`~flask.Flask.test_request_context` 来测试
:func:`~flask.url_for` 的功能。 :meth:`~flask.Flask.test_request_context` 会
让 Flask 在 Python 的 Shell 中如同处理真实请求一样运行。关于这些的更多细节见
:ref:`context-locals` 章节::

  from flask import Flask, url_for

    app = Flask(__name__)

    @app.route('/')
    def index():
        return 'index'

    @app.route('/login')
    def login():
        return 'login'

    @app.route('/user/<username>')
    def profile(username):
        return '{}\'s profile'.format(username)

    with app.test_request_context():
        print(url_for('index'))
        print(url_for('login'))
        print(url_for('login', next='/'))
        print(url_for('profile', username='John Doe'))

    /
    /login
    /login?next=/
    /user/John%20Doe

.. _http-methods:

HTTP 方法
````````````

Web 应用可以接受多种 HTTP 方法访问 URL。我们假定你在用 Flask 的时候已经熟悉了解了
HTTP 方法。默认情况下，路由只会响应 ``GET`` 请求。你可以调整
:meth:`~flask.Flask.route` 装饰器的 ``methods`` 参数来让路由响应其他 HTTP 方法::

    from flask import request

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            return do_the_login()
        else:
            return show_the_login_form()

如果 ``methods`` 方法中包含了 ``GET`` ，Flask 会自动添加 ``HEAD`` 的支持，并会遵照
`HTTP RFC`_ 中的规范响应 ``HEAD`` 请求。同时，也会自动添加 ``OPTIONS`` 方法的支持
无须干预。

.. _HTTP RFC: http://www.ietf.org/rfc/rfc2068.txt

.. _static-files:

静态文件
------------

动态 Web 应用依然也会有静态文件需求，比如 CSS 和 JavaScript 文件。理想情况下，你应该
配置 Web 服务器来提供静态文件，但在开发阶段中，Flask 也可以为静态文件提供同样的服务。
只需要在你的应用 Python 包或模块所在目录中创建一个名为 `static` 的文件夹，就可以在应
用的 `/static` 路径下访问到静态文件。

之后，用特定的 ``'static'`` 端点名生成静态文件的 URL::

    url_for('static', filename='style.css')

这会访问到存储在文件系统中的 ``static/style.css`` 文件。

.. rendering-templates:

模板渲染
-------------------

直接用 Python 生成 HTML 可不是件有趣的事，而且相当繁琐，你还要手动转义 HTML ，避免给
应用带来安全隐患。为此，Flask 默认配置了 `Jinja2 <http://jinja.pocoo.org>`_ 模板
引擎。

渲染模板会用到 :func:`~flask.render_template` 函数。唯一需要你做的就是给这个函数提
供模板名，还有以关键字参数形式提供要传递给模板引擎的变量。下面给出了渲染模板的简单示
例::

    from flask import render_template

    @app.route('/hello/')
    @app.route('/hello/<name>')
    def hello(name=None):
        return render_template('hello.html', name=name)

Flask 会在 `templates` 文件夹里寻找模板。如果你的应用是一个 Python 模块，这个文件夹
应与模块在同一个目录下。如果你的应用是一个 Python 包，那么这个文件夹应作为包的子目录：


**情景 1**: 模块::

    /application.py
    /templates
        /hello.html

**情景 2**: 包::

    /application
        /__init__.py
        /templates
            /hello.html

想要发掘 Jinja2 模板引擎的全部实力？请访问 `Jinja2 模板文档
<http://docs.jinkan.org/docs/jinja2>`_ 了解更多详情。

下面是一个模板示例：

.. sourcecode:: html+jinja

    <!doctype html>
    <title>Hello from Flask</title>
    {% if name %}
      <h1>Hello {{ name }}!</h1>
    {% else %}
      <h1>Hello World!</h1>
    {% endif %}

在模板内部，你依然可以访问到 :class:`~flask.request` 、 :class:`~flask.session`
和 :class:`~flask.g` [#]_ 对象，同样也可以访问到
:func:`~flask.get_flashed_messages` 函数。

模板继承是一个相当实用的功能。请在 :ref:`template-inheritance` 模式文档中了解模板
继承的工作机制。模板继承最基本的用法就是在所有的页面中展示相同的元素（比如页眉、导航
栏和页脚）。

自动转义功能默认是开启的，所以如果 `name` 的值中包含 HTML，它将会被自动转义。如果你
能确保变量的值中 HTML 是安全的（例如是一个模块从 Wiki 语法标记转换的 HTML），可以用
:class:`~jinja2.Markup`  类或模板中的 ``|safe`` 过滤器把这个变量标记为安全的。在
Jinja2 文档中，可以看到更多的例子。

下面即是 :class:`~jinja2.Markup` 类的简单用法:

>>> from flask import Markup
>>> Markup('<strong>Hello %s!</strong>') % '<blink>hacker</blink>'
Markup(u'<strong>Hello &lt;blink&gt;hacker&lt;/blink&gt;!</strong>')
>>> Markup.escape('<blink>hacker</blink>')
Markup(u'&lt;blink&gt;hacker&lt;/blink&gt;')
>>> Markup('<em>Marked up</em> &raquo; HTML').striptags()
u'Marked up \xbb HTML'

.. versionchanged:: 0.5
   自动转义并非在所有模板中都启用。只有这些扩展名的模板会触发自动转义：``.html`` 、
   ``.htm`` 、``.xml`` 、 ``.xhtml`` 。从字符串加载的模板不会触发自动转义。

.. [#] 不确定 :class:`~flask.g` 对象是什么？它可以存储任何你想要的信息，详情见
   :class:`~flask.g` 对象文档和 :ref:`sqlite3` 章节。

.. _accessing-request-data:

获取请求数据
----------------------

对于 Web 应用而言，最重要的就是与客户端发送给服务器的数据交互。在 Flask 中，请求数据
存放在 :class:`~flask.request` 对象中。如果你已有一些 Python 的经验，你也许会好奇
这个对象为什么是个全局对象，为什么 Flask 能保证线程安全。答案是上下文局部变量：

.. _context-locals:

上下文局部变量
``````````````

.. admonition:: 内幕

   如果你想理解上下文局部变量的工作机制，或者是想要了解如何利用环境局部变量实现自动化
   测试，那么请继续阅读此节，可略过本节。

在 Flask 中，只有一些特定的对象是全局对象，但却不是普通的全局对象。这些对象实际上是
特定上下文局部对象的代理。虽然拗口，但其实很容易理解。

想象一下正在处理请求的线程的上下文。一个请求传入后，Web 服务器会产生一个新的线程（或
者是别的东西。只要这个底层对象可以实现一个支持并发的系统即可，不仅限于线程）。当开始进
行 Flask 内部的请求处理工作时，Flask 会认定当前线程作为活动的上下文，并把当前的应用与
WSGI 环境绑定到这个上下文（线程）上。这个实现很精妙，使得一个应用可以直接调用另一个应
用。

那么这么做的意义是什么呢？除非你需要进行单元测试或之类的操作，否则你基本上可以完全忽略
这个设计。你会注意到，如果代码依赖于请求对象，在没有请求对象的时候无法正常运行。解决方
案是手动创建一个请求对象，并把它绑定到上下文中。至于单元测试，最简单的方法是调用
:meth:`~flask.Flask.test_request_context` 上下文管理器。用 `with` 语句绑定一个
测试用请求，之后你就可以与之交互。下面是一个例子::

    from flask import request

    with app.test_request_context('/hello', method='POST'):
        # now you can do something with the request until the
        # end of the with block, such as basic assertions:
        assert request.path == '/hello'
        assert request.method == 'POST'

还有另一种可能：把整个 WSGI 环境传递给 :meth:`~flask.Flask.request_context` 方法::

    from flask import request

    with app.request_context(environ):
        assert request.method == 'POST'

.. _the-request-object:

请求对象
``````````````````

API 章节对请求对象做了详细阐述（参看 :class:`~flask.request` ），这里将不再赘述。本
节会宽泛地介绍一些最常用的操作。首先，从 ``flask`` 模块里导入请求对象::

    from flask import request

:attr:`~flask.request.method` 属性即是当前请求的 HTTP 方法。
:attr:`~flask.request.form` 属性存放的是表单数据（ `POST` 或 `PUT` 请求提交的数据）
下面是使用这两个属性的完整实例::

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

访问 `form` 属性中不存在的键会发生什么？会抛出一个特殊的 :exc:`KeyError` 异常。你可
用捕获标准的 :exc:`KeyError` 一样的方法来捕获它。如果你没有处理这个异常，那么会显示
HTTP 400 Bad Request 错误页面。如此，多数情况无须干预这个行为。

:attr:`~flask.request.args` 属性中是 URL 中提交的参数（ ``?key=value`` ）::

    searchword = request.args.get('q', '')

因为用户可能会随意修改 URL，而直接展现 400 bad request 页面又对用户很不友好。这里我
们推荐用 `get` 来访问 URL 参数，或者考虑捕获 `KeyError` 异常

想了解请求对象的所有方法和属性，参看 :class:`~flask.request` 文档。

.. _file-uploads:

文件上传
````````````

处理文件这种操作在 Flask 里是很简单的。只是要确保你在 HTML 表单中设置了
``enctype="multipart/form-data"`` 属性，否则浏览器不会传输任何文件。

已上传的文件会存储在内存里，或者是文件系统中的临时位置。通过请求对象的
:attr:`~flask.request.files` 属性即可访问上传的文件。每个上传的文件都会存储在这个字
典里。其中的文件瑞祥 与标准的 Python :class:`file` 对象几乎没什么两样，只是会多出一
个 :meth:`~werkzeug.datastructures.FileStorage.save` 方法。调用这个方法就能把文件
保存到服务器的文件系统上。下面是一个用它保存文件的例子::

    from flask import request

    @app.route('/upload', methods=['GET', 'POST'])
    def upload_file():
        if request.method == 'POST':
            f = request.files['the_file']
            f.save('/var/www/uploads/uploaded_file.txt')
        ...

:attr:`~werkzeug.datastructures.FileStorage.filename` 属性是文件在上传前，在客户
端处的文件名。但请务必记住，这个值是可以随意伪造的，不要信任这个值。如果你确实想采纳
客户端提供的文件名用于在服务器上保存文件，那么请把文件名传递给 Werkzeug 提供的
:func:`~werkzeug.utils.secure_filename` 函数::

    from flask import request
    from werkzeug.utils import secure_filename

    @app.route('/upload', methods=['GET', 'POST'])
    def upload_file():
        if request.method == 'POST':
            f = request.files['the_file']
            f.save('/var/www/uploads/' + secure_filename(f.filename))
        ...

在 :ref:`uploading-files` 章节中，有一些更好的例子。

.. _cookies:

Cookies
```````

Cookies 存放在 :attr:`~flask.Request.cookies` 属性中。用响应对象的
:attr:`~flask.Response.set_cookie` 方法来设置 Cookies。请求对象的
:attr:`~flask.Request.cookies` 属性是一个字典，内容则是客户端传入的所有 Cookies。
如果你想使用会话功能，那么不要直接操作 Cookies，请直接使用 Flask 中的
:ref:`sessions` 。会话功能已经替你处理了一些 Cookies 的安全细节问题。

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

请注意，Cookies 是在响应对象上设置的。由于通常情况下，视图函数仅仅是返回字符串，随后
Flask 会把字符串转换为响应对象。当你要显式设置 Cookies 的时候，请使用
:meth:`~flask.make_response` 函数，然后再修改响应对象。

在某些场景下，响应对象尚未存在，却要设置 Cookies。这时可以利用
:ref:`deferred-callbacks` 模式实现。

关于 Cookies 的更多详情，可阅读 :ref:`about-responses` 章节。

.. _redirects-and-errors:

重定向与错误
--------------------

:func:`~flask.redirect` 会把用户重定向到其它 URL 端点。而要放弃请求处理并返回错误代
码，应使用 :func:`~flask.abort` 函数::

    from flask import abort, redirect, url_for

    @app.route('/')
    def index():
        return redirect(url_for('login'))

    @app.route('/login')
    def login():
        abort(401)
        this_is_never_executed()

这个例子只是展示重定向操作的使用，并没有实际意义。因为在这个例子中，用户被从主页重定向
到了一个不能访问的页面（401 即禁止访问）。

默认情况下，错误代码会显示在白底黑字的错误页面上。用
:meth:`~flask.Flask.errorhandler` 装饰器即可定制错误页面::

    from flask import render_template

    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('page_not_found.html'), 404

注意 :func:`~flask.render_template` 调用之后的 ``404`` 。Flask 从这个返回值获知该
页的错误代码：404，即没有找到页面。这个返回值默认为 200，即一切正常。

.. _about-responses:

关于响应
---------------

视图函数的返回值会被自动转换成一个响应对象。如果返回值是一个字符串，则字符串会作为响应
对象的正文，状态码则是 ``200 OK`` ，MIME 类型为 ``text/html``。Flask 转换响应对象
的逻辑如下所述：

1.  如果视图返回了一个正确类型的响应对象，则直接返回这个对象。
2.  如果是字符串，会用字符串数据和默认参数创建响应对象。
3.  如果是元组，且元组中的元素可以提供额外的信息。这样的元组必须是
    ``(response, status, headers)`` 的形式，且至少包含一个元素。 `status` 值会覆盖
    HTTP 状态代码， `headers` 可以是一个 Python 列表或字典，用于额外的 HTTP 标头。
4.  如果都不是，那么 Flask 会假定返回值是一个合法的 WSGI 应用程序，并尝试把它转换成
    响应对象。

如果你想在视图里对响应对象进行操作，请使用 :func:`~flask.make_response` 函数。

假如你有这样的一个视图::

    @app.errorhandler(404)
    def not_found(error):
        return render_template('error.html'), 404

你只需要把返回值表达式传递给 :func:`~flask.make_response` 函数来获取响应对象，之后
就修改响应对象，最后再返回响应对象::

    @app.errorhandler(404)
    def not_found(error):
        resp = make_response(render_template('error.html'), 404)
        resp.headers['X-Something'] = 'A value'
        return resp

.. _sessions:

会话
--------

除请求对象外，还有一个 :class:`~flask.session` 对象，允许跨请求存储特定用户的信息。
它是基于 Cookies 的实现，并且对 Cookies 进行了密码学签名。除非用户获悉了用于签名的
密钥，否则只能查看 Cookies 的内容，而不能修改它。


在使用会话功能之前，要先设置一个密钥。下面是使用会话功能的示例::

    from flask import Flask, session, redirect, url_for, escape, request

    app = Flask(__name__)

    # Set the secret key to some random bytes. Keep this really secret!
    app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

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
            <form method="post">
                <p><input type=text name=username>
                <p><input type=submit value=Login>
            </form>
        '''

    @app.route('/logout')
    def logout():
        # remove the username from the session if it's there
        session.pop('username', None)
        return redirect(url_for('index'))

这里提到的 :func:`~flask.escape` 用于在你模板引擎以外的地方转义字符串，就像上面例子
中一样。

.. admonition:: 如何生成强壮的密钥

   密钥应该尽可能地随机化。操作系统是可以通过密码学意义上的随机数生成器来生成一段相当
   随机的数据。用下面的命令即可快速生成一个用于 :attr:`Flask.secret_key` （或
   :data:`SECRET_KEY` ）的值::

        $ python -c 'import os; print(os.urandom(16))'
        b'_5#y2L"F4Q8z\n\xec]/'

当使用基于 Cookies 的会话时，请注意：Flask 会把你存放在会话对象上值序列化成
Cookies。如果你遇到了在 Cookies 启用的时候，仍无法跨请求保存会话对象上的值，请检查该
页面响应中 Cookies 的大小是否超出了 Web 浏览器所支持的范围。

.. _message-flashing:

消息闪现
----------------

反馈，是一个优秀的应用或用户界面的关键。如果用户不能得到足够的反馈，他们很可能会以厌倦
的心态放弃使用你的应用。Flask 提供了一个非常简便的、向用户提供反馈的功能：消息闪现系
统。大致而言，消息闪现系统在请求结束时记录信息，然后仅在下一个请求中可以访问到这些信
息。通常，我们会在页面布局模板中展现这些消息。

:func:`~flask.flash` 用于记录闪现消息。而要操作已记录的闪现消息，请使用
:func:`~flask.get_flashed_messages` 函数，这个函数也可以在模板中使用。完整的例子
见 :ref:`message-flashing-pattern` 章节。

.. _logging:

日志
-------

.. versionadded:: 0.3

你可能会陷入这样一种境地，你要处理的数据本应是格式正确无误的，而现实却令人失望。比如
会有一些向服务器发送畸形请求的客户端代码。这也许是因为用户篡改了数据，或者是客户端代码
本身质量堪忧。多数情况，遇到这种请求只需返回 ``400 Bad Request`` 就好。但某些情况下
不能这么做，而且还要保证代码继续运行。

此外，你还会想记录下是什么不对劲。日志就是为此而生的。从 Flask 0.3 开始，Flaks 就预
置了日志功能。

下面是几个调用日志记录的例子::

    app.logger.debug('A value for debugging')
    app.logger.warning('A warning occurred (%d apples)', 42)
    app.logger.error('An error occurred')

:attr:`~flask.Flask.logger` 是一个 Python 标准库中的日志类
:class:`~logging.Logger` 。所以，请到官方的 Python 标准库 `logging
文档 <http://docs.python.org/library/logging.html>`_ 了解更多信息。

.. _hooking-in-wsgi-middlewares:

绑定 WSGI 中间件
------------------

如果你要给应用添加 WSGI 中间件，你可以采取封装内部 WSGI 应用的形式来实现。比如假设你
要用 Werkzeug 包中的某个中间件来规避 lightttpd 中的 bug，就可以这样做::

    from werkzeug.contrib.fixers import LighttpdCGIRootFix
    app.wsgi_app = LighttpdCGIRootFix(app.wsgi_app)

.. _using-flask-extensions:

使用 Flask 扩展
----------------------

扩展是一些帮助你完成日常任务的 Python 包。例如，Flask-SQLAlchemy 提供 SQLAlchemy
支持，方便你在 Flask 中调用 SQLAlchemy。

关于 Flask 扩展的更多详情见 :ref:`extensions` 部分。

.. _depolying-to-a-web-server:

部署到 Web 服务器
-------------------------

准备好部署你的新 Flask 应用了？见 :ref:`deployment` 部分。
