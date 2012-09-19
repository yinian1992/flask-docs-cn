延迟加载视图
====================

Flask 通常配合装饰器使用，装饰器使用非常简单，而且使您可以将 URL 和处理它的函数
放在一起。然而这种方法也有一种不足: 这就意味着您使用装饰器的代码必须在前面导入，
否则 Flask 将无法找到您的函数。

这对于需要很快导入的应用程序来说是一个问题，这种情况可能出现在类似谷歌的
App Engine 这样的系统上。所以如果您突然发现您的引用超出了这种方法可以处理
的能力，您可以降级到中央 URL 映射的方法。

用于激活中央 URL 映射的函数是 :meth:`~flask.Flask.add_url_rule` 方法。
您需要提供一个设置应用程序所有 URL 的文件，而不是使用装饰器。

转换到中央 URL 映射
---------------------------------

假象现在的应用的样子如下所示::

    from flask import Flask
    app = Flask(__name__)

    @app.route('/')
    def index():
        pass

    @app.route('/user/<username>')
    def user(username):
        pass

而中央 URL 映射的方法下，您需要一个不包含任何装饰器的文件(`views.py`)，
如下所示::

    def index():
        pass

    def user(username):
        pass

然后使用一个文件初始化应用并将函数映射到 URLs::

    from flask import Flask
    from yourapplication import views
    app = Flask(__name__)
    app.add_url_rule('/', view_func=views.index)
    app.add_url_rule('/user/<username>', view_func=views.user)

延迟加载
------------

目前我们仅仅将视图和路径配置分开了，但是模块仍然是在前面导入的。下面的技巧
使得视图函数可以按需加载。可以使用一个辅助类来实现，这个辅助类以函数的方式
作用，但是当第一次使用某个函数时，它才在内部导入这个函数::

    from werkzeug import import_string, cached_property

    class LazyView(object):

        def __init__(self, import_name):
            self.__module__, self.__name__ = import_name.rsplit('.', 1)
            self.import_name = import_name

        @cached_property
        def view(self):
            return import_string(self.import_name)

        def __call__(self, *args, **kwargs):
            return self.view(*args, **kwargs)

在使用这种方法时，将 `__module__` 和 `__name__` 变量设定为合适的值是很重要的。
在你没有手动指定一个 URL 规则时，这两个变量被 Flask 用于在内部确定如何命名
URL 规则。

现在您就可以定义您将视图整合到的位置，如下所示::

    from flask import Flask
    from yourapplication.helpers import LazyView
    app = Flask(__name__)
    app.add_url_rule('/',
                     view_func=LazyView('yourapplication.views.index'))
    app.add_url_rule('/user/<username>',
                     view_func=LazyView('yourapplication.views.user'))

您可以进一步改进它，以便于节省键盘敲击次数。通过编写一个在内部调用
:meth:`~flask.Flask.add_url_rule` 方法的函数，自动将一个包含项目名称
以及点符号的字符串添加为前缀，并按需将 `view_func` 封装进 `LazyView` ::

    def url(url_rule, import_name, **options):
        view = LazyView('yourapplication.' + import_name)
        app.add_url_rule(url_rule, view_func=view, **options)

    url('/', 'views.index')
    url('/user/<username>', 'views.user')

需要记住的是，请求前后激发的回调处理器必须在一个文件里，并在前面导入，
使之在第一个请求到来之间能够合适地工作。对于其他所有的装饰器来说也是
一样的。
