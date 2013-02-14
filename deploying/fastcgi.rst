.. _deploying-fastcgi:

FastCGI
=======

FastCGI 是在像 `nginx`_ 、 `lighttpd`_ 和 `cherokee`_ 服务器上的一个部署选择。
其它选择见 :ref:`deploying-uwsgi` 和 :ref:`deploying-wsgi-standalone` 章节。
在它们上的任何一个运行你的 WSGI 应用首先需要一个 FastCGI 服务器。最流行的一个
是 `flup`_ ，我们会在本指导中使用它。确保你已经安装好它来跟随下面的说明。

.. admonition:: 注意

   请提前确保你在应用文件中的任何 ``app.run()`` 调用在 ``if __name__ ==
   '__main__':`` 块中或是移到一个独立的文件。这是因为它总会启动一个本地
   的 WSGI 服务器，并且我们在部署应用到 uWSGI 时不需要它。

创建一个 `.fcgi` 文件
-----------------------

首先你需要创建一个 FastCGI 服务器文件。让我们把它叫做
`yourapplication.fcgi`::

    #!/usr/bin/python
    from flup.server.fcgi import WSGIServer
    from yourapplication import app

    if __name__ == '__main__':
        WSGIServer(app).run()

这已经可以为 Apache 工作，而 nginx 和老版本的 lighttpd 需要传递一个
显式的 socket 来与 FastCGI 通信。为此，你需要传递 socket 的路径到
:class:`~flup.server.fcgi.WSGIServer`::

    WSGIServer(application, bindAddress='/path/to/fcgi.sock').run()

这个路径一定与你在服务器配置中定义的路径相同。

把 `yourapplication.fcgi` 文件保存到你能找到的地方。保存在
`/var/www/yourapplication` 或类似的地方是有道理的。

确保这个文件有执行权限，这样服务器才能执行它:

.. sourcecode:: text

    # chmod +x /var/www/yourapplication/yourapplication.fcgi

配置 lighttpd
--------------------

一个给 lighttpd 的基本的 FastCGI 配置看起来是这样::

    fastcgi.server = ("/yourapplication.fcgi" =>
        ((
            "socket" => "/tmp/yourapplication-fcgi.sock",
            "bin-path" => "/var/www/yourapplication/yourapplication.fcgi",
            "check-local" => "disable",
            "max-procs" => 1
        ))
    )

    alias.url = (
        "/static/" => "/path/to/your/static"
    )

    url.rewrite-once = (
        "^(/static.*)$" => "$1",
        "^(/.*)$" => "/yourapplication.fcgi$1"

记得启用 FastCGI ，别名和重写模块。这份配置把应用绑定到
`/yourapplication` 。如果想要应用运行在 URL 根路径，你需要用
:class:`~werkzeug.contrib.fixers.LighttpdCGIRootFix` 中间件来处理
一个 lighttpd 的 bug 。

确保只在应用挂载到 URL 根路径时才应用它。同样，更多信息请翻阅 Lighty
的文档关于 `FastCGI and
Python <http://redmine.lighttpd.net/wiki/lighttpd/Docs:ModFastCGI>`_
的部分（注意显示传递一个 socket 到 run() 不再是必须的）。

配置 nginx
-----------------

在 nginx 上安装 FastCGI 应用有一点不同，因为默认没有 FastCGI 参数被转
发。

一个给 nginx 的基本的 FastCGI 配置看起来是这样::

    location = /yourapplication { rewrite ^ /yourapplication/ last; }
    location /yourapplication { try_files $uri @yourapplication; }
    location @yourapplication {
        include fastcgi_params;
	fastcgi_split_path_info ^(/yourapplication)(.*)$;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;
        fastcgi_pass unix:/tmp/yourapplication-fcgi.sock;
    }

这份配置把应用绑定到 `/yourapplication` 。如果你想要绑定到 URL 跟了路径
会更简单，因为你不需要指出如何获取 `PATH_INFO` 和 `SCRIPT_NAME`::

    location / { try_files $uri @yourapplication; }
    location @yourapplication {
        include fastcgi_params;
        fastcgi_param PATH_INFO $fastcgi_script_name;
        fastcgi_param SCRIPT_NAME "";
        fastcgi_pass unix:/tmp/yourapplication-fcgi.sock;
    }

运行 FastCGI 进程
-------------------------

既然 Nginx 和其它服务器并不加载 FastCGI 应用，你需要手动这么做。
`Supervisor 可以管理 FastCGI 进程。
<http://supervisord.org/configuration.html#fcgi-program-x-section-settings>`_
你可以寻找其它 FastCGI 进程管理器或写一个启动时运行 `.fcgi` 文件的脚本，
例如使用一个 SysV ``init.d`` 脚本。对于临时的解决方案，你总是可以在 GNU
screen 中运行 ``.fcgi`` 。更多细节见 ``man screen`` ，注意这是一个手动
的解决方案，并且不会在系统重启后保留::

    $ screen
    $ /var/www/yourapplication/yourapplication.fcgi

调试
---------

FastCGI 在大多数 web 服务器上的部署，对于调试趋于复杂。服务器日志最经常
告诉发生的事就是成行的“未预期的标头结尾”。为了调试应用，唯一可以让你了解
什么东西破碎的方案就是切换到正确的用户并手动执行应用。

这个例子假设你的应用叫做 `application.fcgi` 并且你的 web 服务器用户是
`www-data`::

    $ su www-data
    $ cd /var/www/yourapplication
    $ python application.fcgi
    Traceback (most recent call last):
      File "yourapplication.fcgi", line 4, in <module>
    ImportError: No module named yourapplication

在这种情况下，错误看起来是“yourapplication”不在 python 路径下。常见的
问题是:

-   使用了相对路径。不要依赖于当前工作目录
-   代码依赖于不是从 web 服务器设置的环境变量
-   使用了不同的 python 解释器

.. _nginx: http://nginx.org/
.. _lighttpd: http://www.lighttpd.net/
.. _cherokee: http://www.cherokee-project.com/
.. _flup: http://trac.saddi.com/flup
