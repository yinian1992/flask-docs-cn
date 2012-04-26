.. _patterns:

Flask 代码模板
==================

Certain things are common enough that the chances are high you will find
them in most web applications.  For example quite a lot of applications
are using relational databases and user authentication.  In that case,
chances are they will open a database connection at the beginning of the
request and get the information of the currently logged in user.  At the
end of the request, the database connection is closed again.

某些东西非常通用，以至于你有很大的机会在绝大部分 Web 应用中，都能找到
他们的身影。例如相当多的应用在使用关系数据库而且包含用户注册和认证模块。
在这种情况下，请求开始之前，他们会打开数据库连接、获得当前已经登陆的用户
信息。在请求结束的时候，数据库连接又会被关闭。

这章提供了一些由用户贡献的代码片段和模板来加速开发 `Flask
Snippet Archives <http://flask.pocoo.org/snippets/>`_.

.. toctree::
   :maxdepth: 2

   packages
   appfactories
   appdispatch
   urlprocessors
   distribute
   fabric
   sqlite3
   sqlalchemy
   fileuploads
   caching
   viewdecorators
   wtforms
   templateinheritance
   flashing
   jquery
   errorpages
   lazyloading
   mongokit
   favicon
   streaming
   deferredcallbacks
