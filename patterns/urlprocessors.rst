使用 URL 处理器
====================

.. versionadded:: 0.7

Flask 0.7 版引入了 URL 处理器的概念。引入此概念的意义在于，对于一部分资源
，他们 URL 共同的部分您并不是很清楚该如何设定。例如您可能有一些 URL 包含了
几个字母用来指定的多国语言语种，但是您不想在每个函数里都手动设别到底是哪个语言。

当与蓝图配合使用时，URL 处理器尤其有用，我们将可以同时处理应用和蓝图指定的
处理器。

多国语言化的应用程序 URL
----------------------------------

试想如下一个网页应用::

    from flask import Flask, g

    app = Flask(__name__)

    @app.route('/<lang_code>/')
    def index(lang_code):
        g.lang_code = lang_code
        ...

    @app.route('/<lang_code>/about')
    def about(lang_code):
        g.lang_code = lang_code
        ...

这可以一大片重复的代码，因为您必须在每个函数当中手动处理 :data:`~flask.g` 中
定义的多国语言字串。当然，一个装饰器可以被用来简化它，但是如果您想要从一个函数
动态生成 URL 到另一个函数，您必须仍然要详细地提供这段多国语言代号码，这将会非常
恼人。

对于后者，这就是让 :func:`~flask.Flask.url_defaults` 函数大展神威的地方了！
这些函数可以自动的将值注入到一个 :func:`~flask.url_for` 的调用中去。下面的
代码检查多语言代号码是否在包含各个 URL 值的字典里，以及末端调用的函数是否接受
一个名为 ``'lang_code'`` 的值::

    @app.url_defaults
    def add_language_code(endpoint, values):
        if 'lang_code' in values or not g.lang_code:
            return
        if app.url_map.is_endpoint_expecting(endpoint, 'lang_code'):
            values['lang_code'] = g.lang_code

URL 映射的函数 :meth:`~werkzeug.routing.Map.is_endpoint_expecting` 可以被用来
识别是否可以给末端的函数提供一个多国语言代号码。

相反的函数是 :meth:`~flask.url_value_preprocessor` 。他们在请求成功
匹配并且能够执行针对 URL 值的代码时立即执行。实际上，他们将信息从包含这些值的
字典当中取出，然后将其放在某个其他的地方::

    @app.url_value_preprocessor
    def pull_lang_code(endpoint, values):
        g.lang_code = values.pop('lang_code', None)

这样，您再也不必在每个函数中都要将 `lang_code` 分配给 :data:`~flask.g` 了。
您可以进一步的改进它，通过编写您自己的装饰器，并使用这些装饰器为包含多国语言
代号码的 URL 添加前缀。但是使用蓝图相比起来会更优雅一些。一旦 ``'lang_code'``
被从字典里弹出，他就不会在被传递到视图函数当中。这样，代码就可简化为如下形式::

    from flask import Flask, g

    app = Flask(__name__)

    @app.url_defaults
    def add_language_code(endpoint, values):
        if 'lang_code' in values or not g.lang_code:
            return
        if app.url_map.is_endpoint_expecting(endpoint, 'lang_code'):
            values['lang_code'] = g.lang_code

    @app.url_value_preprocessor
    def pull_lang_code(endpoint, values):
        g.lang_code = values.pop('lang_code', None)

    @app.route('/<lang_code>/')
    def index():
        ...

    @app.route('/<lang_code>/about')
    def about():
        ...

多国语言化的蓝图 URL
--------------------------------

因为蓝图能够自动的为所有 URL 添加一个普通字符串作为前缀，那么为任何
函数自动执行类似任务也就十分简单了。每个蓝图都可以有一个 URL 处理器，即从
:meth:`~flask.Flask.url_defaults` 函数中移除一整套业务逻辑，因为它不再检查
URL 是否真正与 ``'lang_code'`` 相关::

    from flask import Blueprint, g

    bp = Blueprint('frontend', __name__, url_prefix='/<lang_code>')

    @bp.url_defaults
    def add_language_code(endpoint, values):
        values.setdefault('lang_code', g.lang_code)

    @bp.url_value_preprocessor
    def pull_lang_code(endpoint, values):
        g.lang_code = values.pop('lang_code')

    @bp.route('/')
    def index():
        ...

    @bp.route('/about')
    def about():
        ...
