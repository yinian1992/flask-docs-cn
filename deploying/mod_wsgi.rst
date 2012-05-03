.. _mod_wsgi-deployment:

mod_wsgi (Apache)
=================

如果你使用 `Apache`_ web 服务器，请考虑使用 `mod_wsgi`_ 。

.. admonition:: 注意

   请确保在任何 ``app.run()`` 调用之前，你应该把应用文件放在一个 ``if 
   __name__ == `__main__`:`` 块中或移动到独立的文件。只确保它没被调用是
   因为这总是会启动一个本地的 WSGI 服务器，而当我们使用 mod_wsgi 部署应用
   时并不想让它出现。

.. _Apache: http://httpd.apache.org/

安装 `mod_wsgi`
---------------------

如果你还没有安装过 `mod_wsgi` ，你需要使用包管理器来安装或手动编译它。
mod_wsgi 的 `安装指引`_ 涵盖了 UNIX 系统中的源码安装。

如果你使用 Ubuntu/Debian 你可以按照下面的命令使用 apt-get 获取并激活它:

.. sourcecode:: text

    # apt-get install libapache2-mod-wsgi

在 FreeBSD 上，通过编译 `www/mode_wsgi` port 或使用 pkg_add 来安装:

.. sourcecode:: text

    # pkg_add -r mod_wsgi

如果你在使用 pkgsrc 你可以编译 `www/ap2-wsgi` 包来安装 `mod_wsgi` 。

如果你在 apache 第一次重加载后遇到子进程段错误，你可以安全地忽略它们。
只需要重启服务器。

创建一个 `.wsgi` 文件
-----------------------

你需要一个 `yourapplication.wsgi` 文件来运行你的应用。这个文件包含 `mod_wsgi`
启动时执行的获取应用对象的代码。这个对象在该文件中名为 `application` ，并在
之后作为应用。

对于大多数应用，下面度文件就可以胜任::

    from yourapplication import app as application

如果你没有一个用于创建应用的工厂函数而是单例的应用，你可以直接导入它为
`application` 。

把这个文件放在你可以找到的地方（比如 `/var/www/yourapplication` ）并确保
`yourapplication` 和所有使用的库在 python 载入的路径。如果你不想在系统全局
安装它，请考虑使用 `virtual python`_ 实例。记住你也会需要在 virtualenv
中安装应用。可选地，你可以在 `.wsgi` 文件中在导入前修补路径::

    import sys
    sys.path.insert(0, '/path/to/the/application')

配置 Apache
------------------

你需要做的最后一件事情就是为你的应用创建一个 Apache 配置文件。在本例中，考虑
安全因素，我们让 `mod_wsgi` 来在不同度用户下执行应用:

.. sourcecode:: apache

    <VirtualHost *>
        ServerName example.com

        WSGIDaemonProcess yourapplication user=user1 group=group1 threads=5
        WSGIScriptAlias / /var/www/yourapplication/yourapplication.wsgi

        <Directory /var/www/yourapplication>
            WSGIProcessGroup yourapplication
            WSGIApplicationGroup %{GLOBAL}
            Order deny,allow
            Allow from all
        </Directory>
    </VirtualHost>

更多信息请翻阅 `mod_wsgi wiki`_ 。

.. _mod_wsgi: http://code.google.com/p/modwsgi/
.. _安装指引: http://code.google.com/p/modwsgi/wiki/QuickInstallationGuide
.. _virtual python: http://pypi.python.org/pypi/virtualenv
.. _mod_wsgi wiki: http://code.google.com/p/modwsgi/wiki/

故障排除
---------------

如果你的应用不能运行，按照下面的指导来排除故障:

**问题:** 应用不能运行，错误日志显示, SystemExit 忽略
    你的应用文件中有一个不在 ``if __name__ == '__main__':`` 声明保护下的
    ``app.run()`` 调用。把 :meth:`~flask.Flask.run` 从文件中移除，或者把
    它移到一个独立的 `run.py` 文件，再或者把它放到这样一个 if 块中。

**问题:** 应用报出权限错误
    可能是因为使用了错误的用户运行应用。确保需要访问的应用有合适的权限设置，
    并且使用正确的用户来运行（ `WSGIDaemonProcess` 指令的 ``user`` 和
    ``group`` 参数）

**问题:** 应用崩溃时打印一条错误
    记住 mod_wsgi 禁止对 :data:`sys.stdout` 和 :data:`sys.stderr` 做操作。
    你可以通过设定配置中的 `WSGIRestrictStdout` 为 ``off`` 来禁用这个保护。

    .. sourcecode:: apache

        WSGIRestrictStdout Off

    或者，你可以在 .wsgi 文件中用不同的流来替换标准输出::

        import sys
        sys.stdout = sys.stderr
**问题:** 访问资源时报出 IO 错误
    你的应用可能是一个你符号链接到 site-packages 文件夹的单个 .py 文件。
    请注意这不会正常工作，除非把这个文件放进 pythonpath 包含的文件夹中，
    或是把应用转换成一个包。

    这个问题同样适用于非安装的包，模块文件名用于定位资源，而符号链接会获取
    错误的文件名。

自动重加载支持
-------------------------------

你可以激活自动重载入支持来协助部署工具。无论何时，当 `.wsgi` 文件，
`mod_wsgi` 会为我们自动重新加载所有的守护进程。

为此，只需要直接在你的 `Directory` 节中添加如下内容:

.. sourcecode:: apache

   WSGIScriptReloading On

使用虚拟环境
---------------------------------

虚拟环境的优势是它们永远不在系统全局安装所需的依赖关系，这样你可以更好
地控制使用什么。如果你想要同 mod_wsgi 使用虚拟环境，你需要稍微修改一下
`.wsgi` 文件。

把下面的几行添加到你 `.wsgi` 文件的顶部::

    activate_this = '/path/to/env/bin/activate_this.py'
    execfile(activate_this, dict(__file__=activate_this))

这根据虚拟环境的设置设定了加载路径。记住这个路径一经是绝对的。
