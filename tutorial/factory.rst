.. currentmodule:: flask

.. _application-setup:

设置应用
===========

Flask 应用是 :class:`Flask` 类的实例。应用的一切，比如配置、URL 等等都会用到这个类
来注册到应用上。

要创建一个 Flask 应用，最直接了当的方法就是在代码的顶部直接创建一个人全局的
:class:`Flask` 实例，就像上一页中“Hello, World”例子中的那样。尽管这种写法在某些情景
下简单实用，但在项目规模扩大以后却会导致一系列棘手的问题。

作为替代，应该在函数内部创建 :class:`Flask` 实例。这个函数也就是 *应用工厂* 。一切
配置、注册和应用的设置都要在这个函数内部进行，之后返回这个应用。

应用工厂
-------------

正是该写代码时！创建 ``flaskr`` 目录，并添加 ``__init__.py`` 文件。这个
``__init__.py`` 文件有两个用途：定义应用工厂、让 Python 把 ``flaskr`` 文件夹视为
一个 Python 包。

.. code-block:: none

    mkdir flaskr

.. code-block:: python
    :caption: ``flaskr/__init__.py``

    import os

    from flask import Flask


    def create_app(test_config=None):
        # create and configure the app
        app = Flask(__name__, instance_relative_config=True)
        app.config.from_mapping(
            SECRET_KEY='dev',
            DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
        )

        if test_config is None:
            # load the instance config, if it exists, when not testing
            app.config.from_pyfile('config.py', silent=True)
        else:
            # load the test config if passed in
            app.config.from_mapping(test_config)

        # ensure the instance folder exists
        try:
            os.makedirs(app.instance_path)
        except OSError:
            pass

        # a simple page that says hello
        @app.route('/hello')
        def hello():
            return 'Hello, World!'

        return app

``create_app`` 即是应用工厂函数。随着本教程继续，你会在这个函数里添加别的东西，不过
现在这个函数已经做了许多工作。


#.  ``app = Flask(__name__, instance_relative_config=True)`` 创建
    :class:`Flask` 实例。

    *   ``__name__`` 是当前 Python 模块的名称。应用需要知道当前模块的位置来设定一些
        路径，用 ``__name__`` 指定模块名称即可。
    *   ``instance_relative_config=True`` 使得应用从
        相对于 :ref:`实例文件夹 <instance-folders>` 的路径中获取配置文件。实例文件
        夹位于 ``flaskr`` 包之外，可以用于存放一些不应该提交到版本控制系统中的本地数
        据，比如配置中的密钥、数据库文件等等。

#.  :meth:`app.config.from_mapping() <Config.from_mapping>` 为应用设置一些默认的
    配置：

    *   :data:`SECRET_KEY` 会被 Flask 及其扩展用于加密数据。在开发过程中，可以设置
        为 ``'dev'`` 这样一个临时的值。在实际部署时，应该设置成一个随机的值。

    *   ``DATABASE`` 是 SQLite 数据库文件的路径。这个文件位于
        :attr:`app.instance_path <Flask.instance_path>` 下，也是 Flask 作为实例
        文件夹的路径。在下一节，你会了解到更多关于数据库的内容。

#.  :meth:`app.config.from_pyfile() <Config.from_pyfile>` 用实例文件夹下的
    ``config.py`` 文件中的配置值覆盖默认的配置。比如在实际部署中，设置真正有效的
    ``SECRET_KEY`` 值。

    *   ``test_config`` 也可以传递给应用工厂函数，用以替代实例的配置。这就是为什么，
        在之后的教程写的测试代码可以独立设置与开发环境不一样的配置值。

#.  :func:`os.makedirs` 确保
    :attr:`app.instance_path <Flask.instance_path>` 存在。Flask 并不会自动创建
    实例文件夹，因为 SQLite 数据库文件要放置于此，这里要创建这个文件夹。

#.  :meth:`@app.route() <Flask.route>` 创建一个简单的路由，这样，在继续深入教程的
    其他部分之前，你就能可以见到应用正常运行。它把 URL ``/hello`` 和返回响应的函数
    连接到一起，此处返回的响应是字符串 ``'Hello, World!'`` 。


.. _run-the-application:

运行应用
-------------------

现在你就可以用 ``flask`` 命令运行应用了。在终端里为 Flask 指明应用的位置，然后以开
发模式运行应用。

在开发模式中，页面抛出异常时会显示一个交互式的调试工具，当你修改源码后，服务器会自动重
启加载新的源码。在你跟随本教程的时候，无须干预应用的运行，重新加载浏览器中的页面即可。


在 Linux 或 Mac 下：

.. code-block:: none

    export FLASK_APP=flaskr
    export FLASK_ENV=development
    flask run

如果用 Windows 的 cmd，用 ``set`` 代替 ``export`` ：

.. code-block:: none

    set FLASK_APP=flaskr
    set FLASK_ENV=development
    flask run

如果用 Windows 的 Powershell，用  ``$env:`` 代替 ``export`` ：

.. code-block:: none

    $env:FLASK_APP = "flaskr"
    $env:FLASK_ENV = "development"
    flask run

之后你会看到类似这样的输出：

.. code-block:: none

     * Serving Flask app "flaskr"
     * Environment: development
     * Debug mode: on
     * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
     * Restarting with stat
     * Debugger is active!
     * Debugger PIN: 855-212-761

在浏览器中访问 http://127.0.0.1:5000/hello，如果你可以看到预留的“Hello World”消
息，那么恭喜你，你现在正在运行你的 Flask Web 应用了！

请继续阅读 :doc:`database` 。
