.. _config:

配置处理
======================

应用总会需要某种配置。比如你会需要根据应用所处环境切换调试模式、设置密钥和其他与环境
相关的东西。

Flask 应用通常需要配置才可以启动。虽然在小规模应用的代码中硬编码配置是可行的，但也有
更好的方法。

无论用什么方式加载配置，都会有一个配置对象用于存放加载的配置值：
:class:`~flask.Flask` 对象的 :attr:`~flask.Flask.config` 属性。Flask 本身
和 Flask 扩展也会在其中存放特定配置值。你自己的配置也应该存放在这个对象上。

.. _configruation-basics:

配置基础
--------------------

:attr:`~flask.Flask.config` 实际上是一个字典的子类，可以像修改字典一样修改它::

    app = Flask(__name__)
    app.config['TESTING'] = True

特定的配置值会被推送到 :attr:`~flask.Flask` 对象中，所以你可以在这个对象上读写配置::

    app.debug = True

也可以用 :meth:`dict.update` 一次性更新多个配置键值::

    app.config.update(
        DEBUG=True,
        SECRET_KEY='...'
    )

.. _environment-and-debug-features:

环境与调试特性
------------------------------

:data:`ENV` 和 :data:`DEBUG` 是两个特殊的配置值，因为在应用开始设定配置后，修改这两
个值后，行为并不一致。为了可靠地设定环境与测试模式，Flask 从环境变量中读取这两个配置。

环境用于指示 Flask 及其扩展，还有其他程序（比如 Sentry），Flask 正在何种上下文中运
行。:envvar:`FLASK_ENV` 环境变量控制 Flask 的环境，默认值为 ``production``。

把 :envvar:`FLASK_ENV` 设置为 ``development`` 会启用调试模式，``flask run`` 会在
调试模式下默认启用交互式调试器和代码重新加载机制。想要在单独控制这一行为而不设置环境，
请使用 :envvar:`FLASK_DEBUG` 标志位。

.. versionchanged:: 1.0
    添加了 :envvar:`FLASK_ENV` 环境变量，分离了环境与调试模式的控制。开发环境会默认
    启用调试模式。

要切换 Flask 至开发环境并启用调试模式，请设置 :envvar:`FLASK_ENV`::

    $ export FLASK_ENV=development
    $ flask run

（在 Windows 下，用 ``set`` 替代 ``export``。）

我们推荐使用使用上述的环境变量。尽管你可以在配置或是其他代码中设置 :data:`ENV` 和
:data:`DEBUG`，但强烈不建议这样做。``flask`` 命令不能即时读取到这样设置的配置值，
并且某些系统或扩展可能已经由前述的环境变量中的值设定了配置。

.. _builtin-configuration-values:

内置的配置值
----------------------------

下面的配置值是 Flask 内部使用的：

.. py:data:: ENV

    应用运行的环境。Flask 和扩展会基于环境启用行为，例如启用调试模式。
    :attr:`~flask.Flask.env` 属性映射这个配置键。这个配置会由 :envvar:`FLASK_ENV`
    环境变量设定，而如果从代码中设定则会产生未预期行为。

    **不要在部署到生产环境时启用开发模式。**

    默认值：``'production'``

    .. versionadded:: 1.0

.. py:data:: DEBUG

    调试模式是否启用。当用 ``flask run`` 运行开发服务器时，未处理的异常会显示在交互
    式调试器中，并且服务器会在修改代码后自动加载。:attr:`~flask.Flask.debug` 属性
    映射这个配置键。当 :data:`ENV` 为 ``'development'`` 时这个配置会默认启用，并且
    会被 ``FLASK_DEBUG`` 环境变量覆盖。如果从代码中设定则会产生未预期行为。

    **不要在部署到生产环境时启用开发模式。**

    默认值：如果 :data:`ENV` 为 ``'development'`` 则为 ``True``，否则为
    ``False``。

.. py:data:: TESTING

    启用测试模式。异常会继续传播，而不是被应用的错误处理函数捕获。扩展也会调整行为以
    适宜测试。你应该在自己编写的测试中启用这项配置。

    默认值：``False``

.. py:data:: PROPAGATE_EXCEPTIONS

    异常会重新抛出，而不是被应用的错误处理函数捕获。如果未设定时，当 ``TESTING`` 或
    ``DEBUG`` 二者启用其一，则为 ``True``。

    默认值：``None``

.. py:data:: PRESERVE_CONTEXT_ON_EXCEPTION

    当发生异常时，请求上下文不出栈。如果未设定，则在 ``DEBUG`` 启用时为 ``True``。
    这使得在发生错误时允许调试器内省请求数据，一般情况下不应该直接设定这项配置。

    默认值：``None``

.. py:data:: TRAP_HTTP_EXCEPTIONS

    如果 ``HTTPException`` 类型的异常没有相应的处理函数，则重新抛出这个异常，并交由
    交互式调试器处理，而不是作为简单错误响应返回。

    默认值：``False``

.. py:data:: TRAP_BAD_REQUEST_ERRORS

    试图访问请求字典上不存在的键，比如 ``args`` 和 ``form``，会返回一个 400 Bad
    Request 错误页面。启用这项配置会把错误作为未处理异常来对待，这样你就可以访问到交
    互式调试器。此配置键是一个 ``TRAP_HTTP_EXCEPTIONS`` 的特化版本。如果未设定，则
    在调试模式中默认启用。

    默认值：``None``

.. py:data:: SECRET_KEY

    密钥用于安全地对会话 Cookie 签名，也可以用于扩展或应用的其他安全相关需求。此配置
    项应是一个较长的随机字节串，尽管也支持 Unicode。例如，把这样的输出复制到你的配置
    中::

        python -c 'import os; print(os.urandom(16))'
        b'_5#y2L"F4Q8z\n\xec]/'

    **不要在发表问题或提交代码时暴露密钥。**

    默认值：``None``

.. py:data:: SESSION_COOKIE_NAME

    会话 Cookie 的名称。如果你已经有同名的 Cookie，可以在此修改。

    默认值：``'session'``

.. py:data:: SESSION_COOKIE_DOMAIN

    判定会话 Cookie 有效的域名匹配规则。如未设定此配置键，则 Cookie 将在
    :data:`SERVER_NAME` 的所有子域名下均有效。如果为 ``False``，则不设置 Cookie
    的域名。

    默认值：``None``

.. py:data:: SESSION_COOKIE_PATH

    判定会话 Cookie 有效的路径。如未设定此配置键，则 ``APPLICATION_ROOT`` 或 ``/``
    之下路径均有效。

    默认值：``None``

.. py:data:: SESSION_COOKIE_HTTPONLY

    安全起见，浏览器将不允许 JavaScript 访问标记为“HTTP only”的 Cookie。

    默认值：``True``

.. py:data:: SESSION_COOKIE_SECURE

    浏览器只会随 HTTPS 请求发送标记为“secure”的 Cookie。应用必须配备 HTTPS 此配置
    项才有意义。

    默认值：``False``

.. py:data:: SESSION_COOKIE_SAMESITE

    限制随外部站点请求发送的 Cookie。可以设置为 ``'Lax'``（推荐）或 ``'Strict'``。
    详情见 :ref:`security-cookie`。

    默认值：``None``

    .. versionadded:: 1.0

.. py:data:: PERMANENT_SESSION_LIFETIME

    如果 ``session.permanent`` 为 ``True``，Cookie 的过期时间将设置为未来的多少秒
    以后。可以是 :class:`datetime.timedelta` 或  ``int``。

    Flask 默认的 Cookie 实现会验证密码学签名不超出这个期限。

    默认值：``timedelta(days=31)`` (``2678400`` 秒)

.. py:data:: SESSION_REFRESH_EACH_REQUEST

    控制当 ``session.permanent`` 为 ``True`` 时，是否在每个请求都发送 Cookie。
    在每次请求都发送 Cookie（默认如此）可以有效避免 Cookie 过期，但会占用更大带宽。
    非持久会话不受此项配置影响。

    默认值：``True``

.. py:data:: USE_X_SENDFILE

    提供文件时，设置 ``X-Sendfile`` 标头而不是直接用 Flask 发送文件数据。一些 Web
    服务器，比如 Apache 会识别这个标头并更高效地发送数据。仅在使用支持此特性的
    Web 服务器时有效。

    默认值：``False``

.. py:data:: SEND_FILE_MAX_AGE_DEFAULT

    提供文件时，设定缓存控制的最长过期时间秒数。可以是 :class:`datetime.timedelta`
    或 ``int``。用应用或蓝图中的 :meth:`~flask.Flask.get_send_file_max_age`
    可以覆盖特定文件的此配置值。

    默认值：``timedelta(hours=12)`` (``43200`` 秒)

.. py:data:: SERVER_NAME

    告知应用绑定的主机名和端口。如需匹配子域名路由，则必须设定此配置项。
    
    如果没有设定 ``SESSION_COOKIE_DOMAIN``，则会用于会话 Cookie 域名。现代 Web 浏
    览器不允许给 Cookie 设定不含“.”的域名。那么要使用本地域名，请在 ``hosts`` 文件
    中添加指向应用的域名::

        127.0.0.1 localhost.dev

    如果设定了此配置项，``url_for`` 可以仅在应用上下文中生成外部 URL，而不是额外需要
    请求上下文。

    默认值：``None``

.. py:data:: APPLICATION_ROOT

    告知应用挂载的路径，相对于应用/Web 服务器。

    如果没有设定 ``SESSION_COOKIE_PATH``，则会用于会话 Cookie 的路径。

    默认值：``'/'``

.. py:data:: PREFERRED_URL_SCHEME

    在请求上下文以外时，用于生成外部 URL 的 Scheme。

    默认值：``'http'``

.. py:data:: MAX_CONTENT_LENGTH

    读取传入请求数据的字节数最多不超过这个值。如果未设定此配置项，且请求也没有指定
    ``CONTENT_LENGTH``，那么出于安全考虑，不会读取任何数据。

    默认值：``None``

.. py:data:: JSON_AS_ASCII

    序列化对象为 ASCII 编码的 JSON。如果禁用此配置项，JSON 将作为 Unicode 字符串返
    回，或者由 ``jsonify`` 编码为 ``UTF-8``。把 JSON 渲染到模板的 JavaScript 中
    会导致安全隐患，通常应该启用此配置项。

    默认值：``True``

.. py:data:: JSON_SORT_KEYS

    按照字母顺序对 JSON 对象的键排序。这个配置项在使用缓存时非常有用，因为这样会确保
    数据序列化结果稳定一致，不受 Python 的 Hash 种子影响。尽管不推荐这样做，你可以禁
    用此配置项来以缓存为代价改善性能。

    默认值：``True``

.. py:data:: JSONIFY_PRETTYPRINT_REGULAR

    ``jsonify`` 响应会输出包含换行、空格和缩进的可读内容。在调试模式中该配置项总为启
    用。

    默认值：``False``

.. py:data:: JSONIFY_MIMETYPE

    ``jsonify`` 的 MIME 类型。

    默认值：``'application/json'``

.. py:data:: TEMPLATES_AUTO_RELOAD

    模板修改后自动重新加载。如果未设定此配置项，在调试模式中默认启用。

    默认值：``None``

.. py:data:: EXPLAIN_TEMPLATE_LOADING

    记录模板文件加载的调试信息。这在解决模板未加载，或是加载了错误模板文件的问题时
    非常有用。

    默认值：``False``

.. py:data:: MAX_COOKIE_SIZE

    如果 Cookie 标头字节数大于该值，则发出警告。默认值是 ``4093``。浏览器会静默忽略
    比此更大的 Cookie。设定为 ``0`` 可以禁用警告。

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

.. versionadded:: 0.11
   ``SESSION_REFRESH_EACH_REQUEST``, ``TEMPLATES_AUTO_RELOAD``,
   ``LOGGER_HANDLER_POLICY``, ``EXPLAIN_TEMPLATE_LOADING``

.. versionchanged:: 1.0
    移除了 ``LOGGER_NAME`` 和 ``LOGGER_HANDLER_POLICY``。更多日志的配置信息见
    :ref:`logging` 部分。

    添加了 :data:`ENV`，体现 :envvar:`FLASK_ENV` 环境变量。

    添加了 :data:`SESSION_COOKIE_SAMESITE` 控制会话 Cookie 的 ``SameSite`` 选项。

    添加了 :data:`MAX_COOKIE_SIZE` 控制 Werkzeug 的警告。

.. _configuring-from-files:

从文件加载配置
----------------------

如果你能把配置分割成多个文件，理想状况是放在实际应用 Python 包之外，配置会发挥更大作
用。这样允许你用各种打包工具（见 :ref:`distribute-deployment` 部分）打包、分发应用，
最后修改配置文件。

通用的模式是这样的::

    app = Flask(__name__)
    app.config.from_object('yourapplication.default_settings')
    app.config.from_envvar('YOURAPPLICATION_SETTINGS')

这个模式首先从 `yourapplication.default_settings` 加载配置，然后用
:envvar:`YOURAPPLICATION_SETTINGS` 环境变量指向文件的内容覆盖配置值。在 Linux 或
OS X 下运行服务器之前，用 Shell 中的 export 命令设定环境变量::

    $ export YOURAPPLICATION_SETTINGS=/path/to/settings.cfg
    $ python run-app.py
     * Running on http://127.0.0.1:5000/
     * Restarting with reloader...

在 Windows 下，则用 `set` 代替::

    >set YOURAPPLICATION_SETTINGS=\path\to\settings.cfg

实际上，配置文件本身是 Python 文件。只有大写字母的配置项才会存储到配置对象中。所以请
确保文件中的配置键为大写字母。

下面是一个配置文件示例::

    # Example configuration
    DEBUG = False
    SECRET_KEY = b'_5#y2L"F4Q8z\n\xec]/'

确保尽可能早加载配置，这样扩展才能在启动时访问到配置。配置对象上也有其他方法从单独文件
中加载配置的方法。详细参考请参看 :class:`~flask.Config` 对象的文档。

.. _configuring-form-environment-variables:

从环境变量加载配置
--------------------------------------

除了用环境变量指向配置文件以外，你会发现直接用环境变量控制配置值非常实用（甚至是必要
的）。

在 Linux 或 OS X 下运行服务器之前，用 Shell 中的 export 命令设定环境变量::

    $ export SECRET_KEY='5f352379324c22463451387a0aec5d2f'
    $ export DEBUG=False
    $ python run-app.py
     * Running on http://127.0.0.1:5000/
     * Restarting with reloader...

在 Windows 下，则用 `set` 代替::

    >set SECRET_KEY='5f352379324c22463451387a0aec5d2f'
    >set DEBUG=False

虽然这个方法直接有效，但请记住，环境变量是字符串——它们并不会自动反序列化成 Python 中
的类型。

下面是一个采用环境变量的配置文件示例::

    # Example configuration
    import os

    ENVIRONMENT_DEBUG = os.environ.get("DEBUG", default=False)
    if ENVIRONMENT_DEBUG.lower() in ("f", "false"):
        ENVIRONMENT_DEBUG = False

    DEBUG = ENVIRONMENT_DEBUG
    SECRET_KEY = os.environ.get("SECRET_KEY", default=None)
    if not SECRET_KEY:
        raise ValueError("No secret key set for Flask application")

这里请注意，在 Python 中任何空字符串以外的字符串均视为布尔 ``True`` 值。在环境变
量显式设置为 ``False`` 时尤其需要留心。

确保尽可能早加载配置，这样扩展才能在启动时访问到配置。配置对象上也有其他方法从单独文件
中加载配置的方法。详细参考请参看 :class:`~flask.Config` 对象的文档。

.. _configuration-best-practices:

配置最佳实践
----------------------------

前述的配置方法的缺点是，让测试工作变得困难了。通常，没有单一方案 100% 解决这个问题，
不过你可以记住这两点来改善体验：

1.  在函数中创建应用和注册蓝图。这样你可以创建多个加载不同配置的应用实例，方便单元测
    试。你可以用这个函数按需传入配置。

2.  不要编写在导入期就需要读取配置的代码。如果你限制了自己只在请求中访问配置，你可以
    在之后按需重新设定配置对象。

.. _config-dev-prod:

开发环境与生产环境
------------------------

大多数应用需要不止一份配置。最起码需要两份，一份用于生产服务器，一份用于开发。最简单
的方法就是用总是加载一份默认配置，这份默认配置也应该放进版本控制系统中，然后用另一份
配置覆盖默认配置中的值，就像前述例子中的一样::

    app = Flask(__name__)
    app.config.from_object('yourapplication.default_settings')
    app.config.from_envvar('YOURAPPLICATION_SETTINGS')

然后你可以添加一个单独的 :file:`config.py` 并导出环境变量
``YOURAPPLICATION_SETTINGS=/path/to/config.py`` 就可以了。不过也有其他可选的方式。
例如你可以导入或继承配置。

在 Django 世界中流行的做法是在配置文件中显式导入，在配置文件顶部添加
``from yourapplication.default_settings import *`` 语句，然后再手动覆盖值。
你也可以检查类似 ``YOURAPPLICATION_MODE`` 的环境变量，设定值为 `production`、
`development` 等等，然后基于此导入不同的硬编码配置文件。


一个有趣的模式是用类继承的方式管理配置::

    class Config(object):
        DEBUG = False
        TESTING = False
        DATABASE_URI = 'sqlite:///:memory:'

    class ProductionConfig(Config):
        DATABASE_URI = 'mysql://user@localhost/foo'

    class DevelopmentConfig(Config):
        DEBUG = True

    class TestingConfig(Config):
        TESTING = True

要启用这样的配置，你需要调用 :meth:`~flask.Config.from_object` 方法::

    app.config.from_object('configmodule.ProductionConfig')

管理配置文件的方式有很多，如何管理取决于你。不过，这里给出了一些关于如何管理配置的好
建议：

-   在版本控制系统中保存一份默认配置。要么直接把默认配置填入配置对象，要么在你自己的
    配置文件中覆盖配置项之前导入默认配置。

-   用环境变量切换配置。这个工作是在 Python 解释器外完成的，也就让开发和部署更加简
    单。因为你不需要涉及代码，就可以快速简便地切换不同的配置。如果你经常工作于不同的项
    目间，你甚至可以创建一个脚本专门用于激活虚拟环境并导出开发配置。

-   在生产环境中用类似 `Fabric`_ 的工具向多个开发服务器分别推送代码和配置。关于此的
    更多详情见 :ref:`fabric-deployment` 模式的部分。

.. _Fabric: http://www.fabfile.org/


.. _instance-folders:

实例文件夹
----------------

.. versionadded:: 0.8

Flask 0.8 中引入了实例文件夹的概念。Flask 很长一段时间都允许直接引用相对于应用文件夹
的路径（利用 :attr:`Flask.root_path`）。这也是为什么许多开发者都加载与应用同级放置的
配置文件。不幸的是，这仅在应用不是 Python 包的情况下可用，此时根路径引用的是包的内容。

在 Flask 0.8 中引入了新的属性：:attr:`Flask.instance_path`。它引入了称为
“实例文件夹”的新概念。实例文件夹被设计为，要放在版本控制系统以外，并且是具体部署情况特
定的。也即成为了放置运行期修改的文件或是配置文件的绝佳位置。

你可以在创建 Flask 应用时显式提供实例文件夹路径，也可以让 Flask 自动检测实例文件夹。
显式配置时应使用 `instance_path` 参数::

    app = Flask(__name__, instance_path='/path/to/instance/folder')

请注意这个路径 *必须* 是绝对路径。

如果没有提供 `instance_path` 参数，则默认使用下列位置：

-   未安装的模块::

        /myapp.py
        /instance

-   未安装的包::

        /myapp
            /__init__.py
        /instance

-   安装的模块或包::

        $PREFIX/lib/python2.X/site-packages/myapp
        $PREFIX/var/myapp-instance

    ``$PREFIX`` 是 Python 安装的前缀。可能是 ``/usr``，也可能是虚拟环境的路径。
    你可以输出 ``sys.prefix`` 的值来确定要设定的前缀值。

因为配置对象允许从相对路径的文件名加载配置文件，如果需要，我们也可以从相对于实例文件夹
的路径加载配置文件。调整应用构造函数的 `instance_relative_config` 参数，即可让配
置文件的相对路径在“相对于应用根目录”（默认如此）和“相对于实例文件夹”这两种情况中随意
切换::

    app = Flask(__name__, instance_relative_config=True)

下面是一个设置 Flask 预加载模块中的配置，然后从配置文件夹中加载已存在的配置文件，覆盖
默认配置值的完整示例::

    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('yourapplication.default_settings')
    app.config.from_pyfile('application.cfg', silent=True)

实例文件夹的路径可以从 :attr:`Flask.instance_path` 获取。Flask 也提供了一个打开实例
文件夹中文件的快捷方法，:meth:`Flask.open_instance_resource`。

二者的示例::

    filename = os.path.join(app.instance_path, 'application.cfg')
    with open(filename) as f:
        config = f.read()

    # or via open_instance_resource:
    with app.open_instance_resource('application.cfg') as f:
        config = f.read()
