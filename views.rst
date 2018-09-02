.. _views:

即插视图
===============

.. versionadded:: 0.7

Flask 0.7 引入了即插视图，灵感来自 Django 的基于类而不是函数的通用视图。
其主要目的是让你可以对已实现的部分进行替换，并且这个方式可以定制即插视
图。

基本原则
---------------

假设你有一个从数据库载入对象列表，并渲染到模板的函数::

    @app.route('/users/')
    def show_users(page):
        users = User.query.all()
        return render_template('users.html', users=users)

这个实现简单而灵活，但如果你想用通用的形式，并且能适配其他模型和模板的，这种实现的灵活
程度是不够的。这就是基于类的即插视图的用意所在。首先，把这个视图转换成基于类的视图，你
要这样做::

    from flask.views import View

    class ShowUsers(View):

        def dispatch_request(self):
            users = User.query.all()
            return render_template('users.html', objects=users)

    app.add_url_rule('/users/', ShowUsers.as_view('show_users'))

如你所见，你只需创建一个 :class:`flask.views.View` 的子类，
并且实现 :meth:`~flask.views.View.dispatch_request` 。然后我们需要调用这个类的
:meth:`~flask.views.View.as_view` 方法，把这个类转换为一个实际的视图函数。传递给这
个函数的字符串将作为视图的端点名。但是只用这个方法还不够搞笑，所以我们稍微重构一下代
码::
    
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

对于这么小的例子，这个模式当然没有体现出很大作用，但足以解释基本原则了。当你使用基于类
的视图时，就会有这样的问题：``self`` 指向的是什么？其工作机制是这样的，每当请求分发
后，都会创建一个视图类的实例，也会调用 :meth:`~flask.views.View.dispatch_request`
并填入 URL 规则匹配的参数。视图类本身会用 :meth:`~flask.views.View.as_view` 接受到
的参数实例化。例如，你可以写这样一个类::

    class RenderTemplateView(View):
        def __init__(self, template_name):
            self.template_name = template_name
        def dispatch_request(self):
            return render_template(self.template_name)

然后这样注册它::

    app.add_url_rule('/about', view_func=RenderTemplateView.as_view(
        'about_page', template_name='about.html'))

.. _method-hints:

HTTP 方法提示
--------------

即插视图可以像常规函数一样用 :func:`~flask.Flask.route` 或更好的 
:meth:`~flask.Flask.add_url_rule` 附着到应用对象。然而当附着即插视图时必须提供
HTTP 方法的名称。为了把 HTTP 方法信息转移到类中定义，要在类中添加
:attr:`~flask.views.View.methods` 属性来指明 HTTP 方法::

    class MyView(View):
        methods = ['GET', 'POST']

        def dispatch_request(self):
            if request.method == 'POST':
                ...
            ...

    app.add_url_rule('/myview', view_func=MyView.as_view('myview'))

.. _method-based-dispatching:

基于 HTTP 方法的调度
------------------------

对 RESTful API 而言，需要为每个 HTTP 方法执行不同的函数。用
:class:`flask.views.MethodView` 即可轻松实现这一需求。每个 HTTP 方法都映射到小写的
同名函数::

    from flask.views import MethodView

    class UserAPI(MethodView):

        def get(self):
            users = User.query.all()
            ...

        def post(self):
            user = User.from_form_data(request.form)
            ...

    app.add_url_rule('/users/', view_func=UserAPI.as_view('users'))

如此，你无须指定 :attr:`~flask.views.View.methods` 属性。它会自动的按照类中定义的
方法来设置。

.. _decorating-views:

装饰视图
----------------

既然视图类本身不是能直接加入到路由系统的视图函数，那么装饰视图类并没有多大意义。那么，
你可以手动装饰 :meth:`~flask.views.View.as_view` 的返回值::

    def user_required(f):
        """Checks whether user is logged in or raises error 401."""
        def decorator(*args, **kwargs):
            if not g.user:
                abort(401)
            return f(*args, **kwargs)
        return decorator

    view = user_required(UserAPI.as_view('users'))
    app.add_url_rule('/users/', view_func=view)

从 Flask 0.8 开始，新增了在类声明中声明装饰器列表的方式::

    class UserAPI(MethodView):
        decorators = [user_required]

需要注意的是，由于从调用者的视角来看，``self`` 是隐含的，所以不能直接用常规的视图装饰
器装饰视图类中的方法。

.. _method-views-for-APIs:

用于 API 的方法视图
---------------------

Web API 的工作通常与 HTTP 谓词紧密相关，所以在实现这种 API 时可以说是必须要用到
:class:`~flask.views.MethodView` 类了。即便如此，你也会注意到在大多情况下 API 都需
要访问相同的方法视图的多个 URL 规则。比如考虑这样一种情况，把一个用户对象暴露到 Web
上：

=============== =============== ======================================
URL             HTTP 方法        描述
--------------- --------------- --------------------------------------
``/users/``     ``GET``         获取全部用户的列表
``/users/``     ``POST``        创建新用户
``/users/<id>`` ``GET``         显示某个用户
``/users/<id>`` ``PUT``         更新某个用户
``/users/<id>`` ``DELETE``      删除某个用户
=============== =============== ======================================

那么你想用 :class:`~flask.views.MethodView` 做些什么？诀窍是你可以为同一视图提供多
个规则。

我们假设此时视图是这样::

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

那么我们要怎么把这个视图挂载到路由系统中呢？答案是为添加两条规则，并为每条规则显示指定
HTTP 方法::

    user_view = UserAPI.as_view('user_api')
    app.add_url_rule('/users/', defaults={'user_id': None},
                     view_func=user_view, methods=['GET',])
    app.add_url_rule('/users/', view_func=user_view, methods=['POST',])
    app.add_url_rule('/users/<int:user_id>', view_func=user_view,
                     methods=['GET', 'PUT', 'DELETE'])

如果你有很多相似的 API，那么可以把注册视图的代码重构为下面这样::

    def register_api(view, endpoint, url, pk='id', pk_type='int'):
        view_func = view.as_view(endpoint)
        app.add_url_rule(url, defaults={pk: None},
                         view_func=view_func, methods=['GET',])
        app.add_url_rule(url, view_func=view_func, methods=['POST',])
        app.add_url_rule('%s<%s:%s>' % (url, pk_type, pk), view_func=view_func,
                         methods=['GET', 'PUT', 'DELETE'])

    register_api(UserAPI, 'user_api', '/users/', pk='user_id')
