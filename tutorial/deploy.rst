.. _deploy-to-production:

部署到生产环境
====================

这部分教程假定你有一台即将部署应用的服务器。这里简要介绍如何创建发行包文件并安装，而
且不会指定使用的服务器和软件。你可以在你的开发机上设置一个新环境并尝试按照下面的指引
进行操作，但最好不要用开发机上的环境作为公开运行的应用的托管环境。
:doc:`/deploying/index` 列出了许多托管应用的方式。

.. _build-and-install:

构建与安装
-----------------

如果你要在其他任何地方部署应用，你需要构建一个发行包文件。当前 Python 标准中的发行包
是 *wheel* 格式的，扩展名是 ``.whl`` 。首先，确保安装了 Wheel 库：

.. code-block:: none

    pip install wheel

它提供了用 Python 运行 ``setup.py`` 时可用的构建相关的命令行工具。 ``bdist_wheel``
命令会构建一个 Wheel 发行包文件。

.. code-block:: none

    python setup.py bdist_wheel

之后你会在 ``dist/flaskr-1.0.0-py3-none-any.whl`` 中找到文件。文件名由项目名、版
本和文件安装相关的其他标签组成。

把这个文件复制到其他机器上， :ref:`配置一个全新的虚拟环境 <install-create-env>` ，
然后用 ``pip`` 安装文件。

.. code-block:: none

    pip install flaskr-1.0.0-py3-none-any.whl

Pip 会自动安装项目及其依赖。

因为是在新的机器上运行，你需要重新运行 ``init-db`` 来在实例文件夹中创建数据库。

.. code-block:: none

    export FLASK_APP=flaskr
    flask init-db

当 Flask 检测到项目已经作为包安装（而不是可编辑模式），它会采用另一个目录作为实例文
件夹。你可以在 ``venv/var/flaskr-instance`` 处找到。

.. _configure-the-secret-key:

配置密钥
------------------------

在教程的开始，我们给 :data:`SECRET_KEY` 设置了一个默认值。在生产环境中，应该替换成
一个随机的值。否则，攻击者就能用公开的 ``'dev'`` 密钥值肆意篡改会话 Cookie 和其他用
到密钥的东西。

用下面的命令即可输出一个随机的密钥：

.. code-block:: none

    python -c 'import os; print(os.urandom(16))'

    b'_5#y2L"F4Q8z\n\xec]/'

在实例文件夹中创建 ``config.py`` 文件夹，应用工厂会在该文件存在时读取它。把这个生成
好的值放到 ``config.py`` 文件中。

.. code-block:: python
    :caption: ``venv/var/flaskr-instance/config.py``

    SECRET_KEY = b'_5#y2L"F4Q8z\n\xec]/'

此处你也可以做其他必要的配置。对于 Flaskr 而言，只需要配置 ``SECRET_KEY`` 一处即可。

.. _run-with-a-production-server:

在生产服务器上运行
----------------------------

当处于公开环境而不是开发环境时，你不应该用内置的开发服务器（ ``flask run`` ）运行应
用。开发服务器是由 Werkzeug 提供的，只为方便开发，并没有效率、稳定性和安全性等现实的
考量。

与此相反，你应该使用生产环境的 WSGI 服务器。比如，用 `Waitress`_ 。首先，在虚拟环境
中安装它：

.. code-block:: none

    pip install waitress

你需要向 Waitress 指明应用的位置，但不是像用 ``flask run`` 时配置 ``FLASK_APP`` 环
境变量。这里应该给出导入应用工厂的路径，好让 Waitress 获取应用对象。

.. code-block:: none

    waitress-serve --call 'flaskr:create_app'

    Serving on http://0.0.0.0:8080

:doc:`/deploying/index` 列出了许多托管应用的方式。Waitress 只是一个教程选定的例子，
因为它既支持 Windows 也支持 Linux。对于 WSGI 服务器和部署方式，你有相当多的选择。

.. _Waitress: https://docs.pylonsproject.org/projects/waitress/

继续阅读 :doc:`next` 部分。
