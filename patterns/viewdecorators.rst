视图装饰器
===============

Python 拥有一件非常有趣的特性，那就是函数装饰器。这个特性允许您使用一些
非常简介的语法编辑 Web 应用。因为 Flask 中的每个视图都是一个函数装饰器，
这些装饰器被用来将附加的功能注入到一个或者多个函数中。 :meth:`~flask.Flask.route` 
装饰器您可能已经使用过了。但是在一些情况下您需要实现自己的装饰器。例如，
您有一个仅供登陆后的用户访问的视图，如果未登录的用户试图访问，则把用户
转接到登陆界面。这个例子很好地说明了装饰器的用武之地。

过滤未登录用户的装饰器
--------------------------

现在让我们实现一个这样的装饰器。装饰器是指返回函数的函数，它其实非常简单。
您仅需要记住，当实现一个类似的东西，其实是更新 `__name__` 、 `__module__`
以及函数的其他一些属性，这件事情经常被遗忘。但是您不必亲自动手，这里
有一个专门用于处理这些的以装饰器形式调用的函数(:func:`functools.wraps` )。

这个例子家丁登陆页面的名字是 ``'login'`` 并且当前用户被保存在 `g.user` 当中，
如果么有用户登陆， `g.user` 会是 `None`::

    from functools import wraps
    from flask import g, request, redirect, url_for

    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if g.user is None:
                return redirect(url_for('login', next=request.url))
            return f(*args, **kwargs)
        return decorated_function

所以您怎么使用这些装饰器呢？将它加为视图函数外最里层的装饰器。当添加更多
装饰器的话，一定要记住 :meth:`~flask.Flask.route` 考试最外面的::

    @app.route('/secret_page')
    @login_required
    def secret_page():
        pass

缓存装饰器
-----------------

试想你有一个运算量很大的函数，而且您希望能够将生成的结果在一段时间内
缓存起来，一个装饰器将会非常适合用于干这种事。我们假定您已经参考 :ref:`caching-pattern`
中提到的内容配置好了缓存功能。

这里有一个用作例子的缓存函数，它从一个指定的前缀(通常是一个格式化字符串)
和当前请求的路径生成一个缓存键。请注意我们创建了一个这样的函数: 它先创建
一个装饰器，然后用这个装饰器包装目标函数。听起来很复杂？不幸的是，这的确
有些难，但是代码看起来会非常直接明了。

被装饰器包装的函数将能做到如下几点:

1. 以当前请求和路径为基础生成缓存时使用的键。
2. 从缓存中取出对应键的值，如果缓存返回的不是空，我们就将它返回回去。
3. 如果缓存中没有这个键，那么最初的函数将会被执行，并且返回的值在指定时间
   (默认5分钟内)被缓存起来。

代码如下::

    from functools import wraps
    from flask import request

    def cached(timeout=5 * 60, key='view/%s'):
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                cache_key = key % request.path
                rv = cache.get(cache_key)
                if rv is not None:
                    return rv
                rv = f(*args, **kwargs)
                cache.set(cache_key, rv, timeout=timeout)
                return rv
            return decorated_function
        return decorator

注意，这段代码假定一个示例用的 `cache` 对象时可用的。请参考 :ref:`caching-pattern` 
以获取更多信息。


模板装饰器
--------------------

TurboGears 的家伙们前一段时间发明了一种新的常用范式，那就是模板装饰器。
这个装饰器的关键在于，您将想要传递给模板的值组织成字典的形式，然后从
视图函数中返回，这个模板将会被自动渲染。这样，下面的三个例子就是等价的了::

    @app.route('/')
    def index():
        return render_template('index.html', value=42)

    @app.route('/')
    @templated('index.html')
    def index():
        return dict(value=42)

    @app.route('/')
    @templated()
    def index():
        return dict(value=42)

正如您所看到的，如果没有模板名被指定，那么他会使用 URL 映射的最后一部分，
然后将点转换为反斜杠，最后添加上 ``'.html'`` 作为模板的名字。当装饰器
包装的函数返回，返回的字典就会被传递给模板渲染函数。如果 `None` 被返回
了，那么相当于一个空的字典。如果非字典类型的对象被返回，函数将照原样
将那个对象再次返回。这样您就可以继续使用重定向函数或者返回简单的字符串了。

这是那个装饰器的源代码::

    from functools import wraps
    from flask import request

    def templated(template=None):
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                template_name = template
                if template_name is None:
                    template_name = request.endpoint \
                        .replace('.', '/') + '.html'
                ctx = f(*args, **kwargs)
                if ctx is None:
                    ctx = {}
                elif not isinstance(ctx, dict):
                    return ctx
                return render_template(template_name, **ctx)
            return decorated_function
        return decorator


终端装饰器
------------------

如果您希望使用 werkzeug 路由系统来获得更多的灵活性。您需要将终点(Endpoint)
像 :class:`~werkzeug.routing.Rule` 中定义的那样映射起来。通过一个装饰器
是可以做到的，例如::

    from flask import Flask
    from werkzeug.routing import Rule

    app = Flask(__name__)                                                          
    app.url_map.add(Rule('/', endpoint='index'))                                   

    @app.endpoint('index')                                                         
    def my_index():                                                                
        return "Hello world"     



