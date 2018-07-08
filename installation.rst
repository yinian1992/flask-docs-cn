.. _installation:

安装
============

.. _python-version:

Python 版本
--------------

我们推荐使用最新版本的 Python 3。Flask 支持 Python 3.4 及以上版本、Python 2.7 和
Pypy。

.. _dependencies:

依赖
------------

* `Werkzeug`_ 实现了 WSGI，Web 服务器与应用间的标准 Python 接口。
* `Jinja`_ 是一种模板语言，负责渲染应用提供的页面。
* `MarkupSafe`_ 是与 Jinja 配套的。在渲染模板时转义不可信输入，以避免注入攻击。
* `ItsDangerous`_ 为数据生成数字签名，保证数据的完整性。用于保护 Flask 的会话
  cookie。
* `Click`_ 是一个命令行应用框架。 ``flask`` 就是用这个框架实现的，并且允许你添加自定
  义管理命令。

.. _Werkzeug: http://werkzeug.pocoo.org/
.. _Jinja: http://jinja.pocoo.org/
.. _MarkupSafe: https://pypi.org/project/MarkupSafe/
.. _ItsDangerous: https://pythonhosted.org/itsdangerous/
.. _Click: http://click.pocoo.org/

.. _optional-dependencies:

可选依赖
~~~~~~~~~

这些依赖不会自动安装。如果你安装了它们，Flask 会在自动检测后使用。

* `Blinker`_ 提供 :ref:`signals` 支持。
* `SimpleJSON`_ 是一个高性能的 JSON 实现，与 Python 的 ``json`` 模块兼容。安装后
  将首选用于 JSON 操作。
* `python-dotenv`_  提供在 :ref:`dotenv` 中运行 ``flask`` 命令的支持。
  commands.
* `Watchdog`_ 为开发服务器提供更快、更高效的重新加载机制。

.. _Blinker: https://pythonhosted.org/blinker/
.. _SimpleJSON: https://simplejson.readthedocs.io/
.. _python-dotenv: https://github.com/theskumar/python-dotenv#readme
.. _watchdog: https://pythonhosted.org/watchdog/

.. _virtual-environments:

虚拟环境
---------

无论是生产环境还是开发环境，请使用虚拟环境来管理项目的依赖。

虚拟环境解决了什么问题？你的 Python 项目越多，你也就越有可能使用不同版本 Python 第三
方库，甚至是不同版本的 Python 解释器。不同版本的第三方库会导致项目之间的兼容性冲突。

虚拟环境为每个项目提供一个独立的 Python 库集合，安装项目依赖的包就不会影响其他项目以
及操作系统自带的包。

Python 3 自带的 :mod:`venv` 模块即可创建虚拟环境。如果你使用现代版本的 Python，可以
继续阅读下一节。

Python 2 用户请先阅读 :ref:`install-install-virtualenv` 。

.. _install-create-env:

创建环境
~~~~~~~~~~

创建项目目录和 :file:`venv` 目录：

.. code-block:: sh

    mkdir myproject
    cd myproject
    python3 -m venv venv

Windows 下的操作：

.. code-block:: bat

    py -3 -m venv venv

如果需要安装 virtualenv，是因为你使用了低版本的 Python，请改用如下命令：

.. code-block:: sh

    virtualenv venv

Windows 下的操作：

.. code-block:: bat

    \Python27\Scripts\virtualenv.exe venv

.. _install-activate-env:

激活环境
~~~~~~~~~~

在项目开工之前，请先激活对应的环境：

.. code-block:: sh

    . venv/bin/activate

Windows 下的操作：

.. code-block:: bat

    venv\Scripts\activate

你的 Shell 提示符会变成已激活环境的名称。

.. _install-flask:

安装 Flask
-------------

在激活环境后，用下面的命令安装 Flask：

.. code-block:: sh

    pip install Flask

.. _living-on-the-edge:

摸着石头过河
~~~~~~~~~~~~~~~~~~

如果你想使用最新的、未发行的 Flask 代码，请从 master 分支安装、更新代码：

.. code-block:: sh

    pip install -U https://github.com/pallets/flask/archive/master.tar.gz

.. _install-install-virtualenv:

安装 virtualenv
------------------

如果你正在使用 Python 2，那么 venv 模块是不可用的。可以安装 `virtualenv`_ 作为替代。

在 Linux 下，可以通过包管理器安装 virtualenv：

.. code-block:: sh

    # Debian, Ubuntu
    sudo apt-get install python-virtualenv

    # CentOS, Fedora
    sudo yum install python-virtualenv

    # Arch
    sudo pacman -S python-virtualenv

如果你使用 Mac OS X 或者 Windows，请下载 `get-pip.py`_ ，随后进行如下操作：

.. code-block:: sh

    sudo python2 Downloads/get-pip.py
    sudo python2 -m pip install virtualenv

在 Windows 下，请以管理员权限运行：

.. code-block:: bat

    \Python27\python.exe Downloads\get-pip.py
    \Python27\python.exe -m pip install virtualenv

此后即可继续 :ref:`install-create-env` 一节的操作。

.. _virtualenv: https://virtualenv.pypa.io/
.. _get-pip.py: https://bootstrap.pypa.io/get-pip.py