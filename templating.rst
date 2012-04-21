模板
=========

Flask 利用 Jinja 2 作为模板引擎。你显然可以自由使用其它的模板引擎，但是你
运行 Flask 本身仍然需要安装 Jinja2 。这个需求对启用富扩展是必要的，扩展可
以依赖 Jinja2 存在。

本节只给出一个非常快速的介绍，关于 Jinja2 如何继承到 Flask。如果你想获取
模板引擎本身语法的更多信息，请参考官方 
`Jinja2 模板引擎 <http://jinja.pocoo.org/2/documentation/templates>`_ 。

Jinja 配置
-----------

默认情况下，Jinja 2 会配置为如下:

-   所有扩展名为 ``.html`` 、 ``.htm`` 、 ``.xml`` 以及 ``.xhtml``
    的模板会开启自动转义
-   一个模板可以用 ``{% autoescape %}`` 标签选择自动转义的开关。
-   Flask 在 Jinja2 上下文中插入了几个全局函数和助手，另外还有一些
    目前默认的值

标准上下文
----------------

下面的全局变量默认在 Jinja2 模板中可用:

.. data:: config
   :noindex:

   当前的配置对象 (:data:`flask.config`)

   .. versionadded:: 0.6

.. data:: request
   :noindex:

   当前的请求对象 (:class:`flask.request`)

.. data:: session
   :noindex:

   当前的会话对象 (:class:`flask.session`)

.. data:: g
   :noindex:

   实现全局变量的请求范围的对象 (:data:`flask.g`)

.. function:: url_for
   :noindex:

   :func:`flask.url_for` 函数

.. function:: get_flashed_messages
   :noindex:

   :func:`flask.get_flashed_messages` 函数

.. admonition:: Jinja 上下文行为

   这些变量被添加到上下文变量，它们不是全局变量。区别在于，他们默认不会
   在导入模板的上下文中出现。这样作，一方面是考虑到性能，另一方面是为了
   让事情显式透明。

   这对你以为这什么？如果你希望导入一个宏，你有两种可能来访问请求对象:

   1.   你显式地传入请求或请求对象的属性作为宏的参数。
   2.   你在上下文中（with context）导入了宏。

   在上下文中导入的方式如下:

   .. sourcecode:: jinja

      {% from '_helpers.html' import my_macro with context %}

标准过滤器
----------------

这些过滤器在 Jinja2 中是可用的，也是 Jinja2 自带的过滤器:

.. function:: tojson
   :noindex:

   这个函数把给定的对象转换为 JSON 表示，如果你要动态生成 JavaScript 这里有
   一个非常有用的例子。

   注意 `script` 标签里的东西不应该被转义，因此请用 ``|safe`` 来禁用转义，如
   果你想在 `script` 标签里使用它:

   .. sourcecode:: html+jinja

       <script type=text/javascript>
           doSomethingWith({{ user.username|tojson|safe }});
       </script>

   ``|tojson`` 过滤器会为你妥善地转义斜线。

控制自动转义
------------------------

自动转义的概念是自动转义特殊字符。 HTML （或 XML ，因此也有 XHTML ）意义下
的特殊字符是 ``&`` ， ``>`` ， ``<`` ， ``"`` 以及 ``'`` 。因为这些字符在
文档中表示它们特定的含义，如果你想在文本中使用它们，应该把它们替换成相应
的“实体”。不这么做不仅会导致用户疲于在文本中使用这些字符，也会导致安全问题。
（见 :ref:`xss` ）

虽然有时你会需要在模板中禁用自动转义，这种情况可能是你想要在页面中显式地插
入 HTML ，比如内容来自一个 markdown 到 HTML 转换器的安全的 HTML 输出。

我们有三种方式来完成这个工作:

-   在 Python 中，在传递到模板之前，用 :class:`~flask.Markup` 对象封装 HTML
     字符串。这是一般的推荐方法。
-   在模板中，使用 ``|safe`` 过滤器显式地标记一个字符串为安全的 HTML （
     ``{{ myvariable|safe }}`` ）。
-   临时地完全禁用掉自动转义系统。

在模板中禁用自动转义系统，可以使用 ``{%autoescape %}`` 块:

.. sourcecode:: html+jinja

    {% autoescape false %}
        <p>autoescaping is disabled here
        <p>{{ will_not_be_escaped }}
    {% endautoescape %}

无论何时你这样做，请对这个块中的变量格外小心。

.. _registering-filters:

注册过滤器
-------------------
如果你要在 Jinja2 中注册你自己的过滤器，你有两种方法。你可以把它们手动添加到
应用的 :attr:`~flask.Flask.jinja_env` 或者使用
:meth:`~flask.Flask.template_filter` 装饰器。

下面两个例子作用相同，都是反转一个对象::

    @app.template_filter('reverse')
    def reverse_filter(s):
        return s[::-1]

    def reverse_filter(s):
        return s[::-1]
    app.jinja_env.filters['reverse'] = reverse_filter

在使用装饰器的情况下，如果你想以函数名作为过滤器名，参数是可选的。注册之后，
你可以在模板中像使用 Jinja2 内置过滤器一样使用你的过滤器，例如你在上下文中有
一个名为 `mylist` 的 Python 列表::

    {% for x in mylist | reverse %}
    {% endfor %}


上下文处理器
------------------

Flask 中的上下文处理器自动向模板的上下文中插入新变量。上下文处理器在模板
渲染之前运行，并且可以在模板上下文中插入新值。上下文处理器是一个返回字典
的函数。这个字典的键值将与应用中的所有模板上下文联合::

    @app.context_processor
    def inject_user():
        return dict(user=g.user)

上面的上下文处理器使得一个名为 `user` ，值为 `g.user` 的变量在模板中可用。
这个例子不是很有意思，因为 `g` 无论如何在模板中都是可用的，但是它已经解释
了上下文处理器是如何工作的。

变量不仅限于值；一个上下文处理器也可以使函数在模板中可用（由于 Python 允
许传递函数）::

    @app.context_processor
    def utility_processor():
        def format_price(amount, currency=u'€'):
            return u'{0:.2f}{1}.format(amount, currency)
        return dict(format_price=format_price)

上面的上下文处理器使得 `format_price` 函数在所有模板中可用::

    {{ format_price(0.33) }}

你也可以构建 `format_price` 为一个模板处理器（见
:ref:`registering-filters` ），但这展示了上下文处理器如何传递一个函数。
