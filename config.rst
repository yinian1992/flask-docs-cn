.. _config:

配置处理
======================

.. versionadded:: 0.3

应用会需要某种配置。你可能会需要根据应用环境更改不同的设置，比如切换调试模
式、设置密钥、或是别的设定环境的东西。

Flask 被设计为需要配置来启动应用。你可以在代码中硬编码配置，这对于小的应用
并不坏，但是有更好的方法。

跟你如何载入配置无关，会有一个可用的配置对象保存着载入的配置值:
:class:`~flask.Flask` 对象的 :attr:`~flask.Flask.config` 属性。这是 Flask 
自己放置特定配置值的地方，也是扩展可以存储配置值的地方。但是，你也可以把
自己的配置保存到这个对象里。

配置基础
--------------------

:attr:`~flask.Flask.config` 实际上继承于字典，并且可以像修改字典一样修
改它::

    app = Flask(__name__)
    app.config['DEBUG'] = True

给定的配置值会被推送到 :attr:`~flask.Flask` 对象中，所以你可以在那里读写它
们::

    app.debug = True

你可以使用 :meth:`dict.update` 方法来一次性更新多个键::

    app.config.update(
        DEBUG=True,
        SECRET_KEY='...'
    )

内置的配置值
----------------------------

下列配置值是 Flask 内部使用的:

.. tabularcolumns:: |p{6.5cm}|p{8.5cm}|

================================= =========================================
``DEBUG``                         启用/禁用 调试模式
``TESTING``                       启用/禁用 测试模式
``PROPAGATE_EXCEPTIONS``          显式地允许或禁用异常的传播。如果没有设置
                                  或显式地设置为 `None` ，当 ``TESTING`` 或
                                  ``DEBUG`` 为真时，这个值隐式地为 true.
``PRESERVE_CONTEXT_ON_EXCEPTION`` 默认情况下，如果应用工作在调试模式，请求
                                  上下文不会在异常时出栈来允许调试器内省。
                                  这可以通过这个键来禁用。你同样可以用这个
                                  设定来强制启用它，即使没有调试执行，这对
                                  调试生产应用很有用（但风险也很大）
``SECRET_KEY``                    密钥
``SESSION_COOKIE_NAME``           会话 cookie 的名称。
``SESSION_COOKIE_DOMAIN``         会话 cookie 的域。如果不设置这个值，则
                                  cookie 对 ``SERVER_NAME`` 的全部子域名有效
``SESSION_COOKIE_PATH``           会话 cookie 的路径。如果不设置这个值，且
                                  没有给 ``'/'`` 设置过，则 cookie 对
                                  ``APPLICATION_ROOT`` 下的所有路径有效。
``SESSION_COOKIE_HTTPONLY``       控制 cookie 是否应被设置 httponly 的标志，
                                  默认为 `True` 
``SESSION_COOKIE_SECURE``         控制 cookie 是否应被设置安全标志，默认
                                  为 `False`
``PERMANENT_SESSION_LIFETIME``    以 :class:`datetime.timedelta` 对象控制
                                  长期会话的生存时间。从 Flask 0.8 开始，也
                                  可以用整数来表示秒。
``SESSION_REFRESH_EACH_REQUEST``  这个标志控制永久会话如何刷新。如果被设置为
                                  `True` （这是默认值），每一个请求 cookie
                                  都会被刷新。如果设置为 `False` ，只有当
                                  cookie 被修改后才会发送一个 `set-cookie` 
                                  的标头。非永久会话不会受到这个配置项的影响
                                  。
``USE_X_SENDFILE``                启用/禁用 x-sendfile
``LOGGER_NAME``                   日志记录器的名称
``SERVER_NAME``                   服务器名和端口。需要这个选项来支持子域名
                                  （例如： ``'myapp.dev:5000'`` ）。注意
                                  localhost 不支持子域名，所以把这个选项设
                                  置为 “localhost” 没有意义。设置
                                  ``SERVER_NAME`` 默认会允许在没有请求上下文
                                  而仅有应用上下文时生成 URL
``APPLICATION_ROOT``              如果应用不占用完整的域名或子域名，这个选项可
                                  以被设置为应用所在的路径。这个路径也会用于会
                                  话 cookie 的路径值。如果直接使用域名，则留作
                                  ``None``
``MAX_CONTENT_LENGTH``            如果设置为字节数， Flask 会拒绝内容长度大于
                                  此值的请求进入，并返回一个 413 状态码
``SEND_FILE_MAX_AGE_DEFAULT``:    默认缓存控制的最大期限，以秒计，在
                                  :meth:`flask.Flask.send_static_file` (默认的
                                  静态文件处理器)中使用。对于单个文件分别在
                                  :class:`~flask.Flask` 或
                                  :class:`~flask.Blueprint` 上使用
                                  :meth:`~flask.Flask.get_send_file_max_age`
                                  来覆盖这个值。默认为 43200（12小时）。
``TRAP_HTTP_EXCEPTIONS``          如果这个值被设置为 ``True`` ，Flask不会执行
                                  HTTP 异常的错误处理，而是像对待其它异常一样，
                                  通过异常栈让它冒泡地抛出。这对于需要找出
                                  HTTP 异常源头的可怕调试情形是有用的。
``TRAP_BAD_REQUEST_ERRORS``       Werkzeug 处理请求中的特定数据的内部数据结构会
                                  抛出同样也是“错误的请求”异常的特殊的 key 
                                  errors 。同样地，为了保持一致，许多操作可以
                                  显式地抛出 BadRequest 异常。因为在调试中，你
                                  希望准确地找出异常的原因，这个设置用于在这些
                                  情形下调试。如果这个值被设置为 ``True`` ，你
                                  只会得到常规的回溯。
``PREFERRED_URL_SCHEME``          生成URL的时候如果没有可用的 URL 模式话将使
                                  用这个值。默认为 ``http``
``JSON_AS_ASCII``                 默认情况下 Flask 使用 ascii 编码来序列化对
                                  象。如果这个值被设置为 False ， Flask不会
                                  将其编码为 ASCII，并且按原样输出，返回它的
                                  unicode 字符串。比如 ``jsonfiy`` 会自动地采用
                                  ``utf-8`` 来编码它然后才进行传输。
``JSON_SORT_KEYS``                默认情况下 Flask 按照 JSON 对象的键的顺序来序
                                  来序列化它。这样做是为了确保键的顺序不会受到
                                  字典的哈希种子的影响，从而返回的值每次都是
                                  一致的，不会造成无用的额外 HTTP 缓存。你可
                                  以通过修改这个配置的值来覆盖默认的操作。但
                                  这是不被推荐的做法因为这个默认的行为可能会给
                                  你在性能的代价上带来改善。
``JSONIFY_PRETTYPRINT_REGULAR``   如果这个配置项被  ``True`` （默认值），
                                  如果不是 XMLHttpRequest 请求的话（由
                                  ``X-Requested-With``  标头控制）
                                  json 字符串的返回值会被漂亮地打印出来。
================================= =========================================

.. admonition:: 关于 ``SERVER_NAME`` 的更多

   ``SERVER_NAME`` 用于子域名支持。因为 Flask 在得知现有服务器名之前不能
   猜测出子域名部分，所以如果你想使用子域名，这个选项是必要的，并且也用于会
   话 cookie 。

   请注意，不只是 Flask 有不知道子域名是什么的问题，你的 web 浏览器也会这
   样。现代 web 浏览器不允许服务器名不含有点的跨子域名 cookie 。所以如果你
   的服务器名是 ``'localhost'`` ，你不能在 ``'localhost'`` 和它的每个子域名
   下设置 cookie 。请选择一个合适的服务器名，像 ``'myapplication.local'`` ，
   并添加你想要的 服务器名 + 子域名 到你的 host 配置或设置一个本地 `绑定`_ 。

.. _绑定: https://www.isc.org/software/bind

.. versionadded:: 0.4
   ``LOGGER_NAME``

.. versionadded:: 0.5
   ``SERVER_NAME``

.. versionadded:: 0.6
   ``MAX_CONTENT_LENGTH``

.. versionadded:: 0.7
   ``PROPAGATE_EXCEPTIONS``, ``PRESERVE_CONTEXT_ON_EXCEPTION``

.. versionadded:: 0.8
   ``TRAP_BAD_REQUEST_ERRORS``, ``TRAP_HTTP_EXCEPTIONS``,
   ``APPLICATION_ROOT``, ``SESSION_COOKIE_DOMAIN``,
   ``SESSION_COOKIE_PATH``, ``SESSION_COOKIE_HTTPONLY``,
   ``SESSION_COOKIE_SECURE``

.. versionadded:: 0.9
   ``PREFERRED_URL_SCHEME``

.. versionadded:: 0.10
   ``JSON_AS_ASCII``, ``JSON_SORT_KEYS``, ``JSONIFY_PRETTYPRINT_REGULAR``

.. versionadded:: 1.0
   ``SESSION_REFRESH_EACH_REQUEST``

从文件配置
----------------------

如果你能在独立的文件里存储配置，理想情况是存储在当前应用包之外，它将变得更
有用。这使得通过各式包处理工具（ :ref:`distribute-deployment` ）打包和分发
你的应用成为可能，并在之后才修改配置文件。

则一个常见模式为如下::

    app = Flask(__name__)
    app.config.from_object('yourapplication.default_settings')
    app.config.from_envvar('YOURAPPLICATION_SETTINGS')

首先从 `yourapplication.default_settings` 模块加载配置，然后用
:envvar:`YOURAPPLICATION_SETTINGS` 环境变量指向的文件的内容覆
盖其值。 在 Linux 或 OS X 上，这个环境变量可以在服务器启动之前
，在 shell 中用 export 命令设置::

    $ export YOURAPPLICATION_SETTINGS=/path/to/settings.cfg
    $ python run-app.py
     * Running on http://127.0.0.1:5000/
     * Restarting with reloader...

在 Windows 下则使用其内置的 `set` 命令::

    >set YOURAPPLICATION_SETTINGS=\path\to\settings.cfg

配置文件其实是 Python 文件。只有大写名称的值才会被存储到配置对象中。所以
请确保你在配置键中使用了大写字母。

这里是一个配置文件的例子::

    # Example configuration
    DEBUG = False
    SECRET_KEY = '?\xbf,\xb4\x8d\xa3"<\x9c\xb0@\x0f5\xab,w\xee\x8d$0\x13\x8b83'

确保足够早载入配置，这样扩展才能在启动时访问配置。配置对象上也有其它方法来
从多个文件中载入配置。完整的参考请阅读 :class:`~flask.Config` 对象的文档。


配置的最佳实践
----------------------------

之前提到的建议的缺陷是它会使得测试变得有点困难。基本上，这个问题没有单一的
100% 解决方案，但是你可以注意下面的事项来改善体验:

1.  在函数中创建你的应用，并在上面注册蓝图。这样你可以用不同的配置来创建
    多个应用实例，以此使得单元测试变得很简单。你可以用这样的方法来按需传
    入配置。
2.  不要写出在导入时需要配置的代码。如果你限制只在请求中访问配置，你可以在
    之后按需重新配置对象。


开发 / 生产
------------------------

大多数应用不止需要一份配置。生产服务器和开发期间使用的服务器应该各有一份单独
的配置。处理这个的最简单方法是，使用一份默认的总会被载入的配置，和一部分版本
控制，以及独立的配置来像上面提到的例子中必要的那样覆盖值::

    app = Flask(__name__)
    app.config.from_object('yourapplication.default_settings')
    app.config.from_envvar('YOURAPPLICATION_SETTINGS')

然后你只需要添加一个独立的 `config.py` 文件然后 export 
``YOURAPPLICATION_SETTINGS=/path/to/config.py`` 。不过，也有其它可选的方式。
例如你可以使用导入或继承。


在 Django 世界中流行的是在文件顶部，显式地使用 
``from yourapplication.default_settings import *`` 导入配置文件，并手动覆
盖更改。你也可以检查一个类似 ``YOURAPPLICATION_MODE`` 的环境变量来设置 
`production` ， `development` 等等，并导入基于此的不同的硬编码文件。

一个有意思的模式是在配置中使用类和继承::

    class Config(object):
        DEBUG = False
        TESTING = False
        DATABASE_URI = 'sqlite://:memory:'

    class ProductionConfig(Config):
        DATABASE_URI = 'mysql://user@localhost/foo'

    class DevelopmentConfig(Config):
        DEBUG = True

    class TestingConfig(Config):
        TESTING = True

启用这样的配置你需要调用 :meth:`~flask.Config.from_object` ::

    app.config.from_object('configmodule.ProductionConfig')

管理配置文件有许多方式，这取决于你。这里仍然给出一个好建议的列表:

-   在版本控制中保留一个默认的配置。向配置中迁移这份默认配置，或者在覆盖
    配置值前，在你自己的配置文件中导入它。
-   使用环境变量来在配置间切换。这样可以在 Python 解释器之外完成，使开发
    和部署更容易，因为你可以在不触及代码的情况下快速简便地切换配置。如果你
    经常在不同的项目中作业，你甚至可以创建激活一个 virtualenv 并导出开发
    配置的脚本。
-   使用 `fabric`_ 之类的工具在生产环境中独立地向生产服务器推送代码和配置。
    参阅 :ref:`fabric-deployment` 模式来获得更详细的信息。

.. _fabric: http://fabfile.org/


.. _instance-folders:

实例文件夹
----------------

.. versionadded:: 0.8

Flask 0.8 引入了示例文件夹。 Flask 在很长时间使得直接引用相对应用文件夹
的路径成为可能(通过 :attr:`Flask.root_path` )。这也是许多开发者加载存储
在载入应用旁边的配置的方法。不幸的是，这只会在应用不是包，即根路径指向包
内容的情况下才能工作。

在 Flask 0.8 中，引入了 :attr:`Flask.instance_path` 并提出了“实例文件夹”
的新概念。实例文件夹被为不使用版本控制和特定的部署而设计。这是放置运行时
更改的文件和配置文件的最佳位置。

你可以在创建 Flask 应用时显式地提供实例文件夹的路径，也可以让 Flask 自
动找到它。对于显式的配置，使用 `instance_path` 参数::

    app = Flask(__name__, instance_path='/path/to/instance/folder')

请注意给出的 *一定* 是绝对路径。

如果 `instance_path` 参数没有赋值，会使用下面默认的位置:

-   未安装的模块::

        /myapp.py
        /instance

-   未安装的包::

        /myapp
            /__init__.py
        /instance

-   已安装的包或模块::

        $PREFIX/lib/python2.X/site-packages/myapp
        $PREFIX/var/myapp-instance

    ``$PREFIX`` 是你 Python 安装的前缀。这个前缀可以是 ``/usr`` 或者你的
    virtualenv 的路径。你可以打印 ``sys.prefix`` 的值来查看前缀被设置成
    了什么。

既然配置对象提供从相对文件名来载入配置的方式，那么我们也使得它从相对实例
路径的文件名加载成为可能，如果你想这样做。配置文件中的相对路径的行为可以
在“相对应用的根目录”（默认）和 “相对实例文件夹”中切换，后者通过应用构造函
数的 `instance_relative_config` 开关实现::

    app = Flask(__name__, instance_relative_config=True)

这里有一个配置 Flask 来从模块预载入配置并覆盖配置文件夹中配置文件（如果
存在）的完整例子::

    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('yourapplication.default_settings')
    app.config.from_pyfile('application.cfg', silent=True)

实例文件夹的路径可以在 :attr:`Flask.instance_path` 找到。 Flask 也提供了
一个打开实例文件夹中文件的捷径，就是 :meth:`Flask.open_instance_resource` 。

两者的使用示例::

    filename = os.path.join(app.instance_path, 'application.cfg')
    with open(filename) as f:
        config = f.read()

    # or via open_instance_resource:
    with app.open_instance_resource('application.cfg') as f:
        config = f.read()
