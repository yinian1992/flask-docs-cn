.. _templates:

模板
=========

Flask 默认使用 Jinja2 模板引擎，也允许你自由选择使用其他的模板引擎，但运行 Flask 本
身仍然需要安装 Jinja2。对许多扩展而言，这也是必需的依赖。

本节只简要介绍 Jinja2 是如何集成到 Flask 中的。更多关于 Jinja2 语法的信息，
请参考 `Jinja2 模板引擎 <http://jinja.pocoo.org/2/documentation/templates>`_
官方文档。

.. _jinja-setup:

配置 Jinja
-----------

Flask 中的 Jinja 2 默认配置会是这样:

-   在所有扩展名为 ``.html`` 、 ``.htm`` 、 ``.xml`` 以及 ``.xhtml``
    的模板中开启自动转义。
-   可以用 ``{% autoescape %}`` 标签控制自动转义。
-   Flask 在 Jinja2 上下文中插入了几个全局函数和辅助函数，还有一些其他的默认值。

.. _standard-context:

标准上下文
----------------

默认情况下，可以在 Jinja2 模板访问到这些全局变量:

.. data:: config
   :noindex:

   当前的配置对象（:data:`flask.config`）

   .. versionadded:: 0.6

   .. versionchanged:: 0.10
      现在这总是可用的，甚至在导入的模版里。

.. data:: request
   :noindex:

   当前的请求对象（:class:`flask.request`）。在没有活动请求上下文的情况下渲染模板
   时，这个变量不可用。

.. data:: session
   :noindex:

   当前的会话对象（:class:`flask.session`）。在没有活动请求上下文的情况下渲染模板
   时，这个变量不可用。

.. data:: g
   :noindex:

   请求绑定的全局对象（data:`flask.g`）。在没有活动请求上下文的情况下渲染模板
   时，这个变量不可用。

.. function:: url_for
   :noindex:

   :func:`flask.url_for` 函数。

.. function:: get_flashed_messages
   :noindex:

   :func:`flask.get_flashed_messages` 函数。

.. admonition:: Jinja 上下文的行为

   这些变量并不是 Jinja 的全局变量，只是被添加到了 Jinja 模板的上下文中。区别在于，
   这些变量不会出现在导入的模板的上下文中。这么做一方面是考虑到性能，另一方面是让
   这种行为更为显式直观。

   这对开发者的意义是什么呢？如果你想要导入一个模板宏，而且还是一个依赖于请求对象的
   宏，那么你有两种选择：

   1.   显式传入请求或请求对象的属性作为宏的参数。
   2.   导入宏时使用 with 语句，注入上下文。

   下面的例子展示了如何用 with 语句注入上下文：

   .. sourcecode:: jinja

      {% from '_helpers.html' import my_macro with context %}

.. _standard-filters:

标准过滤器
----------------

你也可以在 Jinja2 里下面的这些模板过滤器，作为 Jinja2 自带过滤器的补充：

.. function:: tojson
   :noindex:

   这个函数把给定的对象转换成 JSON。这里有一个很有用的例子，用来动态生成
   Javascript 代码。

   注意不要转移 `script` 标签里的内容，所以请确保在 0.10 以前版本的 Flask 使用
   ``|safe`` 来禁用转义：

   .. sourcecode:: html+jinja

       <script type=text/javascript>
           doSomethingWith({{ user.username|tojson|safe }});
       </script>

.. _controlling-autoescaping:

控制自动转义
------------------------

自动转义，即是是自动转义特殊字符。 HTML（或 XML，因此也有 XHTML）语法中的特殊字符包
括 ``&``，``>``，``<``，``"`` 以及 ``'``。由于这些字符在 HTML 文档中的语义特殊，
应该把文本中的这些字符替换成相应的“实体”。如果不这么做，不仅会导致用户无法正常使用这
些字符，还会导致一系列安全问题。（见 :ref:`xss`）

尽管如此，你也会有在需要在模板中禁用自动转义的时候，比如在页面中显式插入 Markdown 转
换生成的 HTML。

这里有三条康庄大道：

-   一般推荐的方法是在传递给模板之前，用 :class:`~flask.Markup` 对象封装 HTML 字
    符串。
-   在模板里用 ``|safe`` 过滤器显式地把一个字符串标记为安全的 HTML 
    （``{{ myvariable|safe }}``）。
-   临时彻底禁用自动转义机制。

用 ``{% autoescape %}`` 块级语句即可禁用模板的自动转义机制：

.. sourcecode:: html+jinja

    {% autoescape false %}
        <p>autoescaping is disabled here
        <p>{{ will_not_be_escaped }}
    {% endautoescape %}

禁用自动转义之后，请格外留心这个块里的变量。

.. _registering-filters:

注册过滤器
-------------------

在 Jinja2 中注册自建的过滤器有两种途径。一种是把自建过滤器添加到应用的
:attr:`~flask.Flask.jinja_env` 中，另一种是直接使用
:meth:`~flask.Flask.template_filter` 装饰器。

下面的这两个例子功能是一样的，都是逆置一个对象::

    @app.template_filter('reverse')
    def reverse_filter(s):
        return s[::-1]

    def reverse_filter(s):
        return s[::-1]
    app.jinja_env.filters['reverse'] = reverse_filter

如果你想用函数名作为过滤器名，那么不向装饰器传递任何参数即可。注册好过滤器之后，就可
以像使用 Jinja2 内置过滤器一样使用了。假设上下文中有一个名为 `mylist` 的 Python 列
表::

    {% for x in mylist | reverse %}
    {% endfor %}

.. _context-processors:

上下文处理器
------------------

Flask 中的上下文处理器负责把变量注入到模板上下文中。上下文处理器在模板运行前执行，把
新的值注入到模板的上下文中。上下文处理器是返回字典的函数，这个字典的键值会合并到应用中
所有模板的上下文中::

    @app.context_processor
    def inject_user():
        return dict(user=g.user)

上面的上下文处理器把值为 `g.user` 的 `user` 变量注入到了模板的的上下文中。这个例子
只是为了介绍概念，并没有什么实际意义，因为本来在模板中就可以访问到 `g`。

变量不仅限于值，上下文处理器也可以允许模板访问函数（在 Python 中函数是可以传递的）::


    @app.context_processor
    def utility_processor():
        def format_price(amount, currency=u'€'):
            return u'{0:.2f}{1}.format(amount, currency)
        return dict(format_price=format_price)

上面的上下文处理器使得所有模板可以访问到 `format_price` 函数::

    {{ format_price(0.33) }}

这里只是演示如何在上下文处理器中传递函数，其实你可以把 `format_price` 实现成一个模板
过滤器（见 :ref:`registering-filters` ），
