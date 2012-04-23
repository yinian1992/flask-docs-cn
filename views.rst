.. _views:

即插视图
===============

.. versionadded:: 0.7

Flask 0.7 引入了即插视图，灵感来自 Django 的基于类而不是函数的通用视图。
其主要目的是让你可以对已实现的部分进行替换，并且这个方式可以定制即插视
图。

基本原则
---------------

想象你有一个从数据库载入一个对象列表并渲染到视图的函数::

    @app.route('/users/')
    def show_users(page):
        users = User.query.all()
        return render_template('users.html', users=users)

这是简单而灵活的，但如果你想要用一种通用的，同样可以适应其它模型和模板的
方式来提供这个视图，你会需要更大的灵活性。这就是基于类的即插视图所做的。
第一步，把它转换为基于类的视图，你要这样做::


    from flask.views import View

    class ShowUsers(View):

        def dispatch_request(self):
            users = User.query.all()
            return render_template('users.html', objects=users)

    app.add_url_rule('/users/', ShowUsers.as_view('show_users'))

如你所见，你需要做的是创建一个 :class:`flask.views.View` 的子类，
并且实现 :meth:`~flask.views.View.dispatch_request` 。然后我们需要用类方法
:meth:`~flask.views.View.as_view` 把这个类转换到一个实际的视图函数。你传给
这个函数的字符串是视图之后的最终名称。但是用它自己实现的方法不够有效，所以
我们稍微重构一下代码::
    
    from flask.views import View

    class ListView(View):

        def get_template_name(self):
            raise NotImplementedError()

        def render_template(self, context):
            return render_template(self.get_template_name(), **context)

        def dispatch_request(self):
            context = {'objects': self.get_objects()}
            return self.render_template(context)

    class UserView(ListView):

        def get_template_name(self):
            return 'users.html'

        def get_objects(self):
            return User.query.all()

这当然不是那么有助于一个小例子，但是对于解释基本原则已经很有用了。当你有一
个基于类的视图，那么问题来了， `self` 指向什么。它工作的方式是，无论何时请
求被调度，会创建这个类的一个新实例，并且
:meth:`~flask.views.View.dispatch_request` 方法会以 URL 规则为参数调用。
这个类本身会用传递到 :meth:`~flask.views.View.as_view` 函数的参数来实例化。
比如，你可以像这样写一个类::

    class RenderTemplateView(View):
        def __init__(self, template_name):
            self.template_name = template_name
        def dispatch_request(self):
            return render_template(self.template_name)

然后你可以这样注册它::
And then you can register it like this::

    app.add_url_rule('/about', view_func=RenderTemplateView.as_view(
        'about_page', template_name='about.html'))

方法提示
------------

即插视图可以像常规函数一样用 :func:`~flask.Flask.route` 或更好的 
:meth:`~flask.Flask.add_url_rule` 附加到应用中。然而当你附加它时，你必须
提供 HTTP 方法的名称。为了将这个信息加入到类中，你可以提供
:attr:`~flask.views.View.methods` 属性来承载它::

    class MyView(View):
        methods = ['GET', 'POST']

        def dispatch_request(self):
            if request.method == 'POST':
                ...
            ...

    app.add_url_rule('/myview', view_func=MyView.as_view('myview'))

基于调度的方法
------------------------

对每个 HTTP 方法执行不同的函数，对 RESTful API 非常有用。你可以通过
:class:`flask.views.MethodView` 容易地实现。每个 HTTP 方法映射到同名函数
（只有名称为小写的）::

    from flask.views import MethodView

    class UserAPI(MethodView):

        def get(self):
            users = User.query.all()
            ...

        def post(self):
            user = User.from_form_data(request.form)
            ...

    app.add_url_rule('/users/', view_func=UserAPI.as_view('users'))

如此，你可以不提供 :attr:`~flask.views.View.methods` 属性。它会自动的按照
类中定义的方法来设置。

装饰视图
----------------

既然视图类自己不是加入到路由系统的视图函数，那么装饰视图类并没有多大意义。
相反的，你可以手动装饰 :meth:`~flask.views.View.as_view` 的返回值::

    def user_required(f):
        """Checks whether user is logged in or raises error 401."""
        def decorator(*args, **kwargs):
            if not g.user:
                abort(401)
            return f(*args, **kwargs)
        return decorator

    view = user_required(UserAPI.as_view('users'))
    app.add_url_rule('/users/', view_func=view)

从 Flask 0.8 开始，你也有一种在类声明中设定一个装饰器列表的方法::

    class UserAPI(MethodView):
        decorators = [user_required]

因为从调用者的视角来看 self 是不明确的，所以你不能在单独的视图方法上使用
常规的视图装饰器，请记住这些。

用于 API 的方法视图
---------------------

Web API 的工作通常与 HTTP 动词紧密相关，所以这使得实现这样一个基于
:class:`~flask.views.MethodView` 类的 API 很有意义。也就是说，你会注意到
大多数时候， API 需要不同的 URL 规则来访问相同的方法视图。譬如，想象一种
情况，你在 web 上暴露一个用户对象:

=============== =============== ======================================
URL             HTTP 方法       描述
--------------- --------------- --------------------------------------
``/users/``     ``GET``         获得全部用户的列表
``/users/``     ``POST``        创建一个新用户
``/users/<id>`` ``GET``         显示某个用户
``/users/<id>`` ``PUT``         更新某个用户
``/users/<id>`` ``DELETE``      删除某个用户
=============== =============== ======================================

那么，你会想用 :class:`~flask.views.MethodView` 做什么？诀窍是利用你可以
对相同的视图提供多个规则的事实。

让我们假设这时视图看起来是这个样子::

    class UserAPI(MethodView):

        def get(self, user_id):
            if user_id is None:
                # return a list of users
                pass
            else:
                # expose a single user
                pass

        def post(self):
            # create a new user
            pass

        def delete(self, user_id):
            # delete a single user
            pass

        def put(self, user_id):
            # update a single user
            pass

如此，我们怎样把它挂载到路由系统中？添加两条规则，并且为每条规则显式地
指出 HTTP 方法::

    user_view = UserAPI.as_view('user_api')
    app.add_url_rule('/users/', defaults={'user_id': None},
                     view_func=user_view, methods=['GET',])
    app.add_url_rule('/users/', view_func=user_view, methods=['POST',])
    app.add_url_rule('/users/<int:user_id>', view_func=user_view,
                     methods=['GET', 'PUT', 'DELETE'])

如果你有许多看起来类似的 API ，你可以重构上述的注册代码::

    def register_api(view, endpoint, url, pk='id', pk_type='int'):
        view_func = view.as_view(endpoint)
        app.add_url_rule(url, defaults={pk: None},
                         view_func=view_func, methods=['GET',])
        app.add_url_rule(url, view_func=view_func, methods=['POST',])
        app.add_url_rule('%s<%s:%s>' % (url, pk_type, pk), view_func=view_func,
                         methods=['GET', 'PUT', 'DELETE'])

    register_api(UserAPI, 'user_api', '/users/', pk='user_id')
