.. _make-the-project-installable:

打包项目
======================

打包项目，也即是打包成可安装的包，你需要构建一个可以在其他环境下安装的 *发行包* 文件。
这样你的项目可以像任何其他 Python 库一样安装来部署，这样你才可以用标准 Python 工具来
管理这一切。

除此之外，安装包还可以带来更多的便利，只不过对于本教程和 Python 新手并不显著：

*   目前， Python 和 Flask 知道如何使用 ``flaskr`` 是因为你在项目目录下直接运行。而
    安装包后，你可以在任何地方运行并导入它。

*   你可以像其他包一样管理项目依赖，然后用  ``pip install yourproject.whl`` 安装他
    们。

*   测试工具可以把你的测试环境与开发环境隔离开来。

.. note::
    此教程中这部分内容安排较为靠后，但在你未来的实际项目中，你应该先着手这项操作。

.. _describe-the-project:

描述项目
--------------------

``setup.py`` 描述项目和项目中的文件。

.. code-block:: python
    :caption: ``setup.py``

    from setuptools import find_packages, setup

    setup(
        name='flaskr',
        version='1.0.0',
        packages=find_packages(),
        include_package_data=True,
        zip_safe=False,
        install_requires=[
            'flask',
        ],
    )

``packages`` 让 Python 知道该包含哪个目录（以及目录包含的 Python 文件）作为包。
``find_packages()`` 自动寻找这些目录，所以你不需要手动输入。要包含诸如 static 和
templates 目录的其他文件，需要设置 ``include_package_data`` 。Python 还需要一个
``MANIFEST.in`` 文件来描述这些文件。

.. code-block:: none
    :caption: ``MANIFEST.in``

    include flaskr/schema.sql
    graft flaskr/static
    graft flaskr/templates
    global-exclude *.pyc

这个文件让 Python  把 ``static`` 和 ``templates`` 目录，还有 ``schema.sql`` 文件
也一同复制，并且排除了所有的字节码文件。


这些文件与选项的更多细节见 `Python 官方打包教程 <official packaging guide>`_ 。

.. _official packaging guide: https://packaging.python.org/tutorials/distributing-packages/

.. _install-the-project

安装项目
-------------------

用 ``pip`` 把项安装到虚拟环境中。

.. code-block:: none

    pip install -e .

这让 pip 在当前目录中寻找 ``setup.py`` 并且以 *可编辑* 或者 *开发* 模式安装。可编辑
模式意味着你可以直接修改本地代码而不用重新安装包，除非你修改了包的元信息，比如依赖关
系。

现在你可以用 ``pip list`` 观察项目的安装情况。

.. code-block:: none

    pip list

    Package        Version   Location
    -------------- --------- ----------------------------------
    click          6.7
    Flask          1.0
    flaskr         1.0.0     /home/user/Projects/flask-tutorial
    itsdangerous   0.24
    Jinja2         2.10
    MarkupSafe     1.0
    pip            9.0.3
    setuptools     39.0.1
    Werkzeug       0.14.1
    wheel          0.30.0

迄今为止，运行项目的方式没有变化。只要把 ``FLASK_APP`` 设置成 ``flaskr`` 然后运行
``flask run`` 即可运行应用。

继续阅读 :doc:`tests` 部分。
