.. _project-layout:

项目结构
==============

创建并进入项目目录:

.. code-block:: none

    mkdir flask-tutorial
    cd flask-tutorial

遵照 :doc:`安装指南 </installation>` 来设置一个 Python 虚拟环境，并在其中安装
项目所需的 Flask。

自此，本教程假定你在 ``flask-tutorial`` 目录中进行操作。代码块顶部的文件名也是相对于
这个目录的。

----

Flask 应用可以是简单的单文件应用。

.. code-block:: python
    :caption: ``hello.py``

    from flask import Flask

    app = Flask(__name__)


    @app.route('/')
    def hello():
        return 'Hello, World!'

但当项目规模变大后，就不太可能把所有代码放进单个文件了。Python 项目用 *包* 的概念来
管理代码，并可以分割成多个模块，以在需要的地方导入。本教程也用到了这个方法，

项目目录包含：

* ``flaskr/`` ，包含应用代码和其他文件的 Python 包。
* ``tests/`` ，测试模块的目录。
* ``venv/`` ，Python 虚拟环境，Flask 和其他依赖会安装于此。
* 安装文件描述 Python 安装你的项目的行为。
* 版本控制系统的配置文件，比如 `Git`_ 。无论你的项目规模有多大，都应该养成使用版本控
  制的好习惯。
* 其他文件，以后也许会在项目用到。

.. _git: https://git-scm.com/

最终，你的项目结构会是差不多下面的样子：

.. code-block:: none

    /home/user/Projects/flask-tutorial
    ├── flaskr/
    │   ├── __init__.py
    │   ├── db.py
    │   ├── schema.sql
    │   ├── auth.py
    │   ├── blog.py
    │   ├── templates/
    │   │   ├── base.html
    │   │   ├── auth/
    │   │   │   ├── login.html
    │   │   │   └── register.html
    │   │   └── blog/
    │   │       ├── create.html
    │   │       ├── index.html
    │   │       └── update.html
    │   └── static/
    │       └── style.css
    ├── tests/
    │   ├── conftest.py
    │   ├── data.sql
    │   ├── test_factory.py
    │   ├── test_db.py
    │   ├── test_auth.py
    │   └── test_blog.py
    ├── venv/
    ├── setup.py
    └── MANIFEST.in

如果你用上了版本控制系统，在运行项目时会产生一些文件，你应该配置版本控制系统忽略这些文
件。除此之外，你用的文本编辑器也会生成别的文件。总之，不是你手写的文件都应该被忽略掉。
例如，在 Git 中可以这样配置：

.. code-block:: none
    :caption: ``.gitignore``

    venv/

    *.pyc
    __pycache__/

    instance/

    .pytest_cache/
    .coverage
    htmlcov/

    dist/
    build/
    *.egg-info/

请继续阅读 :doc:`factory` 。
