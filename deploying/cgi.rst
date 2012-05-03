CGI
===

如果所有其它的部署方式都不能奏效，那么 CGI 毫无疑问会奏效。 CGI 被
所有主流服务器支持，但通常性能欠佳。

这也是你在 Google 的 `App Engine`_ 上使用 Flask 应用的方式，其执行方式
恰好是一个 CGI-like 的环境。

.. admonition:: 注意

   请提前确保你在应用文件中的任何 ``app.run()`` 调用在 ``if __name__ ==
   '__main__':`` 块中或是移到一个独立的文件。这是因为它总会启动一个本地
   的 WSGI 服务器，并且我们在部署应用到 uWSGI 时不需要它。

创建一个 `.cgi` 文件
----------------------

首先你需要创建一个 CGI 应用程序文件。我们把它叫做
`yourapplication.cgi`::

    #!/usr/bin/python
    from wsgiref.handlers import CGIHandler
    from yourapplication import app

    CGIHandler().run(app)

服务器配置    
------------

通常有两种方式来配置服务器。直接把 `.cgi` 复制到 `cgi-bin` （并且使用
`mod_rewrite` 或其它类似的东西来重写 URL ） 或让服务器直接指向这个文件。

例如，在 Apache 中你可以在配置中写入这样的语句:

.. sourcecode:: apache

    ScriptAlias /app /path/to/the/application.cgi

更多信息请查阅你的 web 服务器的文档。    

.. _App Engine: http://code.google.com/appengine/
