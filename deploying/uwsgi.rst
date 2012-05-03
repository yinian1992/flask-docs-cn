.. _deploying-uwsgi:

uWSGI
=====

uWSGI 是在像 `nginx`_ 、 `lighttpd`_ 以及 `cherokee`_ 服务器上的一个部署的选
择。更多选择见 :ref:`deploying-fastcgi` 和 :ref:`deploying-wsgi-standalone` 。
你会首先需要一个 uWSGI 服务器来用 uWSGI 协议来使用你的 WSGI 应用。 uWSGI 是
一个协议，同样也是一个应用服务器，可以提供 uWSGI 、FastCGI 和 HTTP 协议。

最流行的 uWSGI 服务器是 `uwsgi`_ ，我们会在本指导中使用。确保你已经安装
好它来跟随下面的说明。

.. admonition:: 注意

   请提前确保你在应用文件中的任何 ``app.run()`` 调用在 ``if __name__ ==
   '__main__':`` 块中或是移到一个独立的文件。这是因为它总会启动一个本地
   的 WSGI 服务器，并且我们在部署应用到 uWSGI 时不需要它。

用 uwsgi 启动你的应用
----------------------------

`uwsgi` 被设计为操作在 python 模块中找到的 WSGI 可调用量。

已知在 myapp.py 中有一个 flask 应用，使用下面的命令:

.. sourcecode:: text

    $ uwsgi -s /tmp/uwsgi.sock --module myapp --callable app

或者，你喜欢这样:

.. sourcecode:: text

    $ uwsgi -s /tmp/uwsgi.sock -w myapp:app

配置 nginx
-----------------

一个基本的 flaks uWSGI 的给 nginx 的 配置看起来是这样::

    location = /yourapplication { rewrite ^ /yourapplication/; }
    location /yourapplication { try_files $uri @yourapplication; }
    location @yourapplication {
      include uwsgi_params;
      uwsgi_param SCRIPT_NAME /yourapplication;
      uwsgi_modifier1 30;
      uwsgi_pass unix:/tmp/uwsgi.sock;
    }

这个配置绑定应用到 `/yourapplication` 。如果你想要绑定到 URL 根会更简单，因
你不许要告诉它 WSGI `SCRIPT_NAME` 或设置 uwsgi modifier 来使用它::

    location / { try_files $uri @yourapplication; }
    location @yourapplication {
        include uwsgi_params;
        uwsgi_pass unix:/tmp/uwsgi.sock;
    }

.. _nginx: http://nginx.org/
.. _lighttpd: http://www.lighttpd.net/
.. _cherokee: http://www.cherokee-project.com/
.. _uwsgi: http://projects.unbit.it/uwsgi/
