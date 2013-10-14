.. _blueprints:

用蓝图实现模块化的应用
====================================

.. versionadded:: 0.7

Flask 用 *蓝图（blueprints）* 的概念来在一个应用中或跨应用制作应用组件和支
持通用的模式。蓝图很好地简化了大型应用工作的方式，并提供给 Flask 扩展在应用
上注册操作的核心方法。一个 :class:`Blueprint` 对象与 :class:`Flask` 应用对
象的工作方式很像，但它确实不是一个应用，而是一个描述如何构建或扩展应用的
*蓝图* 。

为什么使用蓝图？
----------------

Flask 中的蓝图为这些情况设计:

* 把一个应用分解为一个蓝图的集合。这对大型应用是理想的。一个项目可以实例化
  一个应用对象，初始化几个扩展，并注册一集合的蓝图。
* 以 URL 前缀和/或子域名，在应用上注册一个蓝图。 URL 前缀/子域名中的参数即
  成为这个蓝图下的所有视图函数的共同的视图参数（默认情况下）。
* 在一个应用中用不同的 URL 规则多次注册一个蓝图。
* 通过蓝图提供模板过滤器、静态文件、模板和其它功能。一个蓝图不一定要实现应
  用或者视图函数。
* 初始化一个 Flask 扩展时，在这些情况中注册一个蓝图。

Flask 中的蓝图不是即插应用，因为它实际上并不是一个应用——它是可以注册，甚至
可以多次注册到应用上的操作集合。为什么不使用多个应用对象？你可以做到那样
（见 :ref:`app-dispatch` ），但是你的应用的配置是分开的，并在 WSGI 层管理。

蓝图作为 Flask 层提供分割的替代，共享应用配置，并且在必要情况下可以更改所
注册的应用对象。它的缺点是你不能在应用创建后撤销注册一个蓝图而不销毁整个
应用对象。

蓝图的设想
-------------------------

蓝图的基本设想是当它们注册到应用上时，它们记录将会被执行的操作。
当分派请求和生成从一个端点到另一个的 URL 时，Flask 会关联蓝图中的视图函数。


我的第一个蓝图
------------------

这看起来像是一个非常基本的蓝图。在这个案例中，我们想要实现一个简单渲染静态
模板的蓝图::

    from flask import Blueprint, render_template, abort
    from jinja2 import TemplateNotFound

    simple_page = Blueprint('simple_page', __name__,
                            template_folder='templates')

    @simple_page.route('/', defaults={'page': 'index'})
    @simple_page.route('/<page>')
    def show(page):
        try:
            return render_template('pages/%s.html' % page)
        except TemplateNotFound:
            abort(404)

当我们使用 ``@simple_page.route`` 装饰器绑定函数时，在蓝图之后被注册时它
会记录把 `show` 函数注册到应用上的意图。此外，它会给函数的端点加上
由 :class:`Blueprint` 的构造函数中给出的蓝图的名称作为前缀（在此例
中是 ``simple_page`` ）。

注册蓝图
----------------------

那么你如何注册蓝图？像这样::

    from flask import Flask
    from yourapplication.simple_page import simple_page

    app = Flask(__name__)
    app.register_blueprint(simple_page)

如果你检查已经注册到应用的规则，你会发现这些::

    [<Rule '/static/<filename>' (HEAD, OPTIONS, GET) -> static>,
     <Rule '/<page>' (HEAD, OPTIONS, GET) -> simple_page.show>,
     <Rule '/' (HEAD, OPTIONS, GET) -> simple_page.show>]

第一个显然是来自应用自身，用于静态文件。其它的两个用于 ``simple_page``
蓝图中的 `show` 函数。如你所见，它们的前缀是蓝图的名称，并且用一个点
（ ``.`` ）来分割。

不过，蓝图也可以在不同的位置挂载::

    app.register_blueprint(simple_page, url_prefix='/pages')

那么，这些果然是生成出的规则::

    [<Rule '/static/<filename>' (HEAD, OPTIONS, GET) -> static>,
     <Rule '/pages/<page>' (HEAD, OPTIONS, GET) -> simple_page.show>,
     <Rule '/pages/' (HEAD, OPTIONS, GET) -> simple_page.show>]

在此之上，你可以多次注册蓝图，虽然不是每个蓝图都会正确地响应这些。实际上，
蓝图能否被多次挂载，取决于蓝图是怎样实现的。


蓝图资源
-------------------

蓝图也可以提供资源。有时候你会只为它提供的资源而引入一个蓝图。

蓝图资源文件夹
`````````````````````````

像常规的应用一样，蓝图被设想为包含在一个文件夹中。当多个蓝图源于同一个文件
夹时，可以不必考虑上述情况，但也这通常不是推荐的做法。

这个文件夹会从 :class:`Blueprint` 的第二个参数中推断出来，通常是 `__name__` 。
这个参数决定对应蓝图的是哪个逻辑的 Python 模块或包。如果它指向一个存在的
Python 包，这个包（通常是文件系统中的文件夹）就是资源文件夹。如果是一个模块，
模块所在的包就是资源文件夹。你可以访问 :attr:`Blueprint.root_path` 属性来查看
资源文件夹是什么::

    >>> simple_page.root_path
    '/Users/username/TestProject/yourapplication'

可以使用 :meth:`~Blueprint.open_resource` 函数来快速从这个文件夹打开源文件::

    with simple_page.open_resource('static/style.css') as f:
        code = f.read()

静态文件
````````````

一个蓝图可以通过 `static_folder` 关键字参数提供一个指向文件系统上文件夹的路
径，来暴露一个带有静态文件的文件夹。这可以是一个绝对路径，也可以是相对于蓝图
文件夹的路径::

    admin = Blueprint('admin', __name__, static_folder='static')

默认情况下，路径最右边的部分就是它在 web 上所暴露的地址。因为这里这个文件夹
叫做 ``static`` ，它会在 蓝图 + ``/static`` 的位置上可用。也就是说，蓝图为
``/admin`` 把静态文件夹注册到 ``/admin/static`` 。

最后是命名的 `blueprint_name.static` ，这样你可以生成它的 URL ，就像你对应用
的静态文件夹所做的那样::

    url_for('admin.static', filename='style.css')

模板
`````````
如果你想要蓝图暴露模板，你可以提供 :class:`Blueprint` 构造函数中的
`template_folder` 参数来实现::

    admin = Blueprint('admin', __name__, template_folder='templates')

像对待静态文件一样，路径可以是绝对的或是相对蓝图资源文件夹的。模板文件夹会
被加入到模板的搜索路径中，但是比实际的应用模板文件夹优先级低。这样，你可以
容易地在实际的应用中覆盖蓝图提供的模板。

那么当你有一个 ``yourapplication/admin`` 文件夹中的蓝图并且你想要渲染
``'admin/index.html'`` 模板，且你已经提供了 ``templates`` 作为
`template_folder` ，你需要这样创建文件:
``yourapplication/admin/templates/admin/index.html``

构造 URL
-------------

当你想要从一个页面链接到另一个页面，你可以像通常一个样使用 :func:`url_for`
函数，只是你要在 URL 的末端加上蓝图的名称和一个点（ ``.`` ）作为前缀::

    url_for('admin.index')

此外，如果你在一个蓝图的视图函数或是模板中想要从链接到同一蓝图下另一个端点，
你可以通过对端点只加上一个点作为前缀来使用相对的重定向::

    url_for('.index')

这个案例中，它实际上链接到 ``admin.index`` ，假如请求被分派到任何其它的
admin 蓝图端点。
