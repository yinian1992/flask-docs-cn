用 JQuery 实现 Ajax 
====================

`jQuery`_ 是一个小型的 JavaScript 库，它通常被用来简化 DOM 和 JavaScript 
操作。通过在服务器和客户端之间交换 JSON 数据是使得 Web 应用动态化的完美方式。

JSON 本身是一个很清量级的数据传输格式，非常近似于 Python 的原始数据类型
(数字、字符串、字典和链表等)，这一数据格式被广泛支持，而且非常容易解析。
它几年前开始流行，然后迅速取代了 XML 在 Web 应用常用数据传输格式中的地位。

如果您使用 Python 2.6 以上版本，JSON 的解析库是开箱即用的。在 Python 2.5 中
您则必须从 PyPI 安装 `simplejson`_ 库。

.. _jQuery: http://jquery.com/
.. _simplejson: http://pypi.python.org/pypi/simplejson

加载 jQuery
--------------

为了使用 jQuery 您需要先下载它，然后将其放置在您应用的静态文件夹中，并
确认他被加载了。理想的情况下是，您有一个用于所有页面的布局模板。要加载 jQuery 
您只需要在这个布局模板中 `<body>` 标签的最下方添加一个 script 标签。

.. sourcecode:: html

   <script type=text/javascript src="{{
     url_for('static', filename='jquery.js') }}"></script>

另一个加载 jQuery 的技巧是使用 Google 的 `AJAX Libraries API
<http://code.google.com/apis/ajaxlibs/documentation/>`_ :


.. sourcecode:: html

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.js"></script>
    <script>window.jQuery || document.write('<script src="{{
      url_for('static', filename='jquery.js') }}">\x3C/script>')</script>

在以上配置的情况下，您需要将 jQuery 放置到静态文件夹当中作为一个备份。浏览器将会
首先尝试直接从 Google 加载 jQuery。如果您的用户至少一次访问过使用 Google 提供的
的 jQuery 版本的话，浏览器就会缓存这个代码，这样您的网站就可以从中获得加载更快的
好处了。

我的站点在哪?
-----------------

您知道您的应用在哪里运行么？如果您在开发过程当中，那么答案非常简单: 
它运行在本地端口，而且就在这个 URL 的根路径位置。但是如果您后来决定将
您的应哟ing移动到一个不同的未知怎么办？比如 ``http://example.com/myapp`` ？
在服务器这边，这从来不是一个问题，原因是我们使用的 :func:`~flask.url_for`
函数可以帮我们回答这个问题。但是如果我们在使用 jQuery 我们不应该将指向
应用的路径硬编码到程序中，而是将它动态化。该如何做到这点呢？

一个简单的技巧可能是为我们的页面添加一个 script 标签，然后设定一个全局变量
作为一个应用根路径的前缀。如下所示:

.. sourcecode:: html+jinja

   <script type=text/javascript>
     $SCRIPT_ROOT = {{ request.script_root|tojson|safe }};
   </script>

这里的 ``|safe`` 是必要的。这样 Jinja 才不会将 JSON 编码的字符串以 HTML 的规则
过滤处理掉。通常这种过滤是必要的，但是在 `script` 标签块当中有着不同于原先的过滤
规则。

.. admonition:: 可能有用的信息

   In HTML the `script` tag is declared `CDATA` which means that entities
   will not be parsed.  Everything until ``</script>`` is handled as script.
   This also means that there must never be any ``</`` between the script
   tags.  ``|tojson`` is kind enough to do the right thing here and
   escape slashes for you (``{{ "</script>"|tojson|safe }}`` is rendered as
   ``"<\/script>"``).

   在 HTML 中， `script` 标签被声明为 `CDATA` 。这意味着 HTML 转义实体将不会
   被解析。在 ``</script>`` 出现之前的所有内容都被当做脚本处理。这也意味着在
   script 标签的内容之中不应该出现 ``</`` 字样。``|tojson`` 足以在这里完成
   正确的事情，他将会为您过滤掉斜杠(``{{ "</script>"|tojson|safe }}`` 将会被
   渲染成 ``"<\/script>"``)。


JSON 视图函数
-------------------

现在让我们创建一个服务端函数，这个服务端函数接收两个数字形式的 URL 参数，
然后将这两个数字相加并以 JSON 对象的形式返回给应用。这是一个相当可笑的例子，
您通常会在服务端直接实现这个功能。但是这是一个方便展示如何配合使用 jQuery 和
Flask 最简单的例子了::

    from flask import Flask, jsonify, render_template, request
    app = Flask(__name__)

    @app.route('/_add_numbers')
    def add_numbers():
        a = request.args.get('a', 0, type=int)
        b = request.args.get('b', 0, type=int)
        return jsonify(result=a + b)

    @app.route('/')
    def index():
        return render_template('index.html')

正如您所见，我们在这里添加了一个 `index` 函数，这个函数用于渲染一个模板。
这个模板将会按照上面的提供的方法加载 jQuery ，并且包含一个小表单用于提供
加法运算的两个数，同时表单还提供了用于激发服务器端函数的一个链接。

注意，这里我们使用不会抛出错误的 :meth:`~werkzeug.datastructures.MultiDict.get` 方法。
如果对应的键不存在，一个默认值(这里是 ``0``)将hi被返回。更进一步，我们还可以将值转换
为一个特定类型(就像我们这里的 `int` 类型)。这对于由脚本(APIs,JavaScript等)激发的代码
来说是个非常顺手的工具，因为在这种情况下您不需要特别的错误报告。

HTML 部分
----------

您的 index.html 要么继承一个已经加载了 jQuery 且设定了 `$SCRIPT_ROOT` 环境变量的 
`layout.html` 模板，要么自己在上方完成了这些事。以下是我们的小应用 (`index.html`)
所需的 HTML 代码。请注意这里我们也将脚本直接写入了 HTML。通常来讲，将脚本代码放置
到一个独立的脚本文件里是一个更好的点子。

.. sourcecode:: html

    <script type=text/javascript>
      $(function() {
        $('a#calculate').bind('click', function() {
          $.getJSON($SCRIPT_ROOT + '/_add_numbers', {
            a: $('input[name="a"]').val(),
            b: $('input[name="b"]').val()
          }, function(data) {
            $("#result").text(data.result);
          });
          return false;
        });
      });
    </script>
    <h1>jQuery Example</h1>
    <p><input type=text size=5 name=a> +
       <input type=text size=5 name=b> =
       <span id=result>?</span>
    <p><a href=# id=calculate>calculate server side</a>

我们不会过多介绍 jQuery 使用的细节，仅仅对以上代买做一个快速的解释:

1. ``$(function() { ... })`` 将会在浏览器加载完页面的基础内容之后立即执行。
2. ``$('selector')`` 选择一个用于操作的元素。
3. ``element.bind('event', func)`` 指定元素被单击时运行的函数，如果这个函数
   返回 `false` ，那么单击操作的默认行为将被取消。在本例中，点击操作的默认
   行为是导航到 `#` 链接标签。
4. ``$.getJSON(url, data, func)`` 发送一个 `GET` 请求给 `url` ，其中 `data`
   对象的内容将以查询参数的形式发送。一旦数据抵达，它将以返回值作为参数执行
   给定的函数。请注意，我们在这里可以使用我们先前设定的 `$SCRIPT_ROOT` 变量。

如果您还没有完全了解这个例子，可以从 github 上下载 `本例源码
<http://github.com/mitsuhiko/flask/tree/master/examples/jqueryexample>`_ 。
