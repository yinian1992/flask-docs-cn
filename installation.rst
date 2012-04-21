.. _installation:

安装
============

Flask 依赖于两个外部库， `Werkzeug
<http://werkzeug.pocoo.org/>`_ 和 `Jinja2 <http://jinja.pocoo.org/2/>`_.
Werkzeug 是一个 WSGI 工具包，在 web 应用和多种服务器之间开发和部署的标准 Python 接口。Jinja2 负责渲染模板。

那么如何快速获得你计算机中的一切？你有很多种方式来完成，但是最强大的方式是 virtualenv ，所以我们第一个来看它。

你需要 Python 2.5 或更高的版本来开始，所以请确认有一个最新的 Python 2.x 安装。本文编写时，WSGI 的 Python 3 规格尚未定案，所以 Flask 不能支持 Python 3.x 系列。

.. _virtualenv:

virtualenv
----------

virtualenv 可能是你在开发中想要使用的，并且如果你拥有生产环境的 shell 权限时，你也会乐于在生产环境中使用。

virtualenv 解决了什么问题？如果你像我一样喜欢 Python，你可能不仅想要在基于 Flask 的 web 应用，还会想要在其它项目中使用它。但是，你拥有的项目越多，你用不同版本 Python 工作的可能性越大，或者至少 Python 库的版本不同。让我们直面现实：库破坏向后兼容性的情况相当常见，而且任何正经的应用零依赖都不太可能。如此，当你的项目中有两个或以上出现依赖性冲突，你会怎么做？

virtualenv 来拯救世界！virtualenv 允许多个并排的 Python 安装，每个项目都可以有一个安装。它实际上并没有安装独立的 Python 副本，但是它确实提供了一种巧妙的方式来让各项目环境保持独立。让我们来看看 virtualenv 是怎么工作的。

如果你在 Mac OS X 或 Linux下，下面两条命令可能会适用::

    $ sudo easy_install virtualenv

或更好的::

    $ sudo pip install virtualenv

上述的某个命令会在你的系统中安装 virtualenv。它甚至可能会出现在包管理器中。如果你使用 Ubuntu ，请尝试::

    $ sudo apt-get install python-virtualenv

如果你所在的 Windows 上并没有 `easy_install` 命令，你必须先安装它。查阅 :ref:`windows-easy-install` 章节 来获得更多如何做的信息。一旦你安装了它，运行上述的命令，但是要去掉 `sudo` 前缀。

一旦你安装了virtualenv，激活 shell 然后创建你自己的环境。我通常创建一个项目文件夹，包含一个 `venv` 文件夹 ::

    $ mkdir myproject
    $ cd myproject
    $ virtualenv venv
    New python executable in venv/bin/python
    Installing distribute............done.

现在，无论何时你想在一个项目上工作，你只需要激活相应的环境。在 OS X 和 Linux 上，执行如下操作::

    $ . venv/bin/activate

如果你是一个 Windows 用户，下面的操作适用::

    $ venv\scripts\activate

无论哪种方式，你应该正在使用你的 virtualenv （注意你的 shell 提示符已经变更为显示活动的环境）。

现在你只需要键入以下的命令来激活你的 virtualenv 中的 Flask::

    $ pip install Flask

几秒钟后，安装就搞定了。


系统全局安装
------------------------

这样也是可能的，虽然我不推荐。只需要以 root 权限运行 `pip`::

    $ sudo pip install Flask

（在 Windows 上，在管理员权限的命令提示符中运行这条命令，去掉 `sudo`。）


活在边缘
------------------

如果你想要用最新版本的 Flask 作业，有两种途径：你可以使用 `pip` 拉取开发版本，或让它操作一个 git checkout 。无论哪种方式，依然推荐使用 virtualenv。

在一个全新的 virtualenv 中获取 git checkout 并运行在开发模式下::

    $ git clone http://github.com/mitsuhiko/flask.git
    Initialized empty Git repository in ~/dev/flask/.git/
    $ cd flask
    $ virtualenv venv --distribute
    New python executable in venv/bin/python
    Installing distribute............done.
    $ . venv/bin/activate
    $ python setup.py develop
    ...
    Finished processing dependencies for Flask

这会拉取依赖关系并激活 git head 作为 virtualenv 中的当前版本。然后你只需要执行 ``git pull origin`` 来升级到最新版本。

没有 git 时，获取开发版本的替代操作::

    $ mkdir flask
    $ cd flask
    $ virtualenv venv --distribute
    $ . venv/bin/activate
    New python executable in venv/bin/python
    Installing distribute............done.
    $ pip install Flask==dev
    ...
    Finished processing dependencies for Flask==dev

.. _windows-easy-install:

Windows 下的 `pip` 和 `distribute`
-----------------------------------

在 Windows 下， `easy_install` 的安装稍微有点麻烦，但还是相当简单。最简单的方法是下载 `distribute_setup.py` 文件并运行它。运行这个文件最简单的方法就是打开你的下载文件夹并且双击这个文件。

下一步，添加你的 Python 安装中的 Scripts 文件夹到 `PATH`环境变量来使 `easy_install` 命令和其它 Python 脚本加入到命令行自动搜索到的路径。做法是：右键单击桌面上或是“开始”菜单中的“我的电脑”图标，选择“属性”，然后单击“高级系统设置”（在 Windows XP 中，单击“高级”选项卡），然后单击“环境变量”按钮，最后双击“系统变量”栏中的“Path”变量，并加入你的 Python 解释器的 Scripts 文件夹。确保你用分号把它和现有的值分隔开。假设你使用 Python 2.7 且为默认目录，添加下面的值::

    ;C:\Python27\Scripts

于是，你就搞定了！检查它是否正常工作，打开命令提示符并执行 ``easy_install`` 。如果你开启了 Windows Vista 或 Windows 7 中的用户账户控制，它应该会提示你使用管理员权限。

现在你有了 ``easy_install`` ，你可以用它来安装 ``pip``::

    > easy_install pip

.. _distribute_setup.py: http://python-distribute.org/distribute_setup.py
