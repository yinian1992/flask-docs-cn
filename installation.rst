.. _installation:

安装
============

Flask 依赖两个外部库：`Werkzeug
<http://werkzeug.pocoo.org/>`_ 和 `Jinja2 <http://jinja.pocoo.org/2/>`_ 。
Werkzeug 是一个 WSGI（在 Web 应用和多种服务器之间的标准 Python 接口) 工具
集。Jinja2 负责渲染模板。

那么如何在你的电脑上安装这一切？虽说条条大道通罗马，但是最强大的方式是
virtualenv ，所以我们首先来看它。

你首先需要 Python 2.6 或更高的版本，所以请确认有一个最新的 Python 2.x 安装。
在 Python 3 中使用 Flask 请参考： :ref:`python3-support` 。

.. _virtualenv:

virtualenv
----------

你很可能想在开发中用上 virtualenv，如果你有生产环境的 shell 权限，你同样
会乐于在生产环境中使用它。

virtualenv 解决了什么问题？如果你像我一样喜欢 Python，不仅会在采用 Flask
的Web 应用中用上 virtualenv，在别的项目中你也会想用上它。你拥有的项目越
多，同时使用不同版本的 Python 工作的可能性也就越大，或者起码需要不同版本
的 Python 库。悲惨现实是：常常会有库破坏向后兼容性，然而正经应用不采用外
部库的可能微乎其微。当在你的项目中，出现两个或更多依赖性冲突时，你会怎么
做？

virtualenv 拯救世界！virtualenv 为每个不同项目提供一份 Python 安装。它并
没有真正安装多个 Python 副本，但是它确实提供了一种巧妙的方式来让各项目环
境保持独立。让我们来看看 virtualenv 是怎么工作的。

如果你在 Mac OS X 或 Linux 下，下面两条命令可能会适用::

    $ sudo easy_install virtualenv

或更好的::

    $ sudo pip install virtualenv

上述的命令会在你的系统中安装 virtualenv。它甚至可能会存在于包管理器中，
如果你用的是 Ubuntu，可以尝试::

    $ sudo apt-get install python-virtualenv

如果你用的是 Windows ，而且没有 `easy_install` 命令，那么你必须先安装这
个命令。查阅 :ref:`windows-easy-install` 章节了解如何安装。之后，运行上
述的命令，但是要去掉 `sudo` 前缀。

virtualenv 安装完毕后，你可以立即打开 shell 然后创建你自己的环境。我通
常创建一个项目文件夹，并在其下创建一个 `venv` 文件夹 ::

    $ mkdir myproject
    $ cd myproject
    $ virtualenv venv
    New python executable in venv/bin/python
    Installing distribute............done.

现在，无论何时你想在某个项目上工作，只需要激活相应的环境。在 OS X 和
Linux 上，执行如下操作::

    $ . venv/bin/activate

下面的操作适用 Windows::

    $ venv\scripts\activate

无论通过哪种方式，你现在应该已经激活了 virtualenv（注意你的 shell 提示符
显示的是当前活动的环境）。

现在你只需要键入以下的命令来激活 virtualenv 中的 Flask::

    $ pip install Flask

几秒钟后，一切都搞定了。

.. _system-wide-installation:

全局安装
------------------------

这样也是可以的，虽然我不推荐。只需要以 root 权限运行 `pip`::

    $ sudo pip install Flask

（在 Windows 上，在管理员权限的命令提示符中去掉 `sudo` 运行这条命令 。）

.. _living-on-the-edge:

活在边缘
------------------

如果你需要最新版本的 Flask，有两种方法：你可以使用 `pip` 拉取开发版本，
或让它操作一个 git checkout。无论哪种方式，依然推荐使用 virtualenv。

在一个全新的 virtualenv 中 git checkout 并运行在开发模式下::

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

这会拉取依赖并激活 git head 作为 virtualenv 中的当前版本。然后你只需要执
行 ``git pull origin`` 来升级到最新版本。

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

在 Windows 下， `easy_install` 的安装稍微有点麻烦，但还是相当简单。最简
单的方法是下载 `distribute_setup.py` 文件并运行它。运行这个文件最简单的
方法就是打开你的下载文件夹并且双击这个文件。

下一步，把你的 Python 安装中的 Scripts 文件夹添加到 `PATH` 环境变量来，
这样 `easy_install` 命令和其它 Python 脚本就加入到了命令行自动搜索的路
径。做法是：右键单击桌面上或是“开始”菜单中的“我的电脑”图标，选择“属性”，
然后单击“高级系统设置”（在 Windows XP 中，单击“高级”选项卡），然后单击
“环境变量”按钮，最后双击“系统变量”栏中的“Path”变量，并加入你的 Python
解释器的 Scripts 文件夹。确保你用分号把它和现有的值分隔开。假设你使用
Python 2.7 且为默认目录，添加下面的值::

    ;C:\Python27\Scripts

如此，你就搞定了！打开命令提示符并执行 ``easy_install`` 测试它是否正常
工作。如果你开启了 Windows Vista 或 Windows 7 中的用户账户控制，它应该
会提示你使用管理员权限。

现在你有了 ``easy_install`` ，你可以用它来安装 ``pip``::

    > easy_install pip

.. _distribute_setup.py: http://python-distribute.org/distribute_setup.py
