.. _app-factories:

应用程序的工厂函数
=====================

如果您已经开始使用包和蓝图(:ref:`blueprints`)辅助您的应用开发了，那么
这里还有一些非常好的办法可以进一步的提升开发体验。当蓝图被导入的时候，
一个通用的模板将会负责创建应用程序对象。但是如果你将这个对象的创建工作
移交给一个函数来完成，那么你就可以在此后创建它的多个实例。

这么做的目的在于:

1.  测试。你可以使用多个应用程序的实例，为每个实例分配分配不同的配置，
    从而测试每一种不同的情况。
2.  多个实例。想象以下情景：您需要同时运行同一个应用的不同版本，您当然可以
    在你的Web服务器中配置多个实例并分配不同的配置，但是如果你使用工厂函数，
    你就可以在一个随手即得的进程中运行这一个应用的不同实例了！

那么该如何使用他们呢？

基础的工厂函数
---------------

您可以像下面展示的这样，从一个函数里启动这个应用::

    def create_app(config_filename):
        app = Flask(__name__)
        app.config.from_pyfile(config_filename)

        from yourapplication.views.admin import admin
        from yourapplication.views.frontend import frontend
        app.register_blueprint(admin)
        app.register_blueprint(frontend)

        return app

有得必有失，在导入时，您无法在蓝图中使用这个应用程序对象。然而您可以在一个
请求中使用他。如果获取当前配置下的对应的应用程序对象呢？请使用:
:data:`~flask.current_app` 函数::

    from flask import current_app, Blueprint, render_template
    admin = Blueprint('admin', __name__, url_prefix='/admin')

    @admin.route('/')
    def index():
        return render_template(current_app.config['INDEX_TEMPLATE'])

在这里我们从配置中查找一个网页模板文件的名字。

使用应用程序
------------------

所以，要使用这样的一个应用，你必须先创建这个应用对象，这里是一个
运行此类程序的 `run.py` 文件的例子::

    from yourapplication import create_app
    app = create_app('/path/to/config.cfg')
    app.run()

工厂函数的改进
--------------------

前文所提供的工厂函数并不是特别聪明好用，您可以改进它，如下的
改变可以是直接且可行的:

1.  使得在单元测试中传入配置值成为可行，以使您不必在文件系统中
    创建多个配置文件。
2.  在程序初始时从蓝图中调用一个函数，这样您就有机会修改应用的参数属性了
    (就像在在请求处理器前后的调用钩子等)
3.  如果必要的话，在应用正在被创建时添加 WSGI 中间件。
