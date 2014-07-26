.. _deployment:

部署选择
==================

取决于你现有的，有多种途径来运行 Flask 应用。你可以在开发过程中使用内置的
服务器，但是你应该为用于生产的应用选择使用完整的部署。（不要在生产环境中使
用内置的开发服务器）。这里给出几个可选择的方法并且给出了文档。

如果你有一个不同的 WSGI 服务器，查阅文档中关于如何用它运行一个 WSGI 应用
度部分。请记住你的 :class:`Flask` 应用对象就是实际的 WSGI 应用。

选择托管服务来快速配置并运行，参阅快速上手中的
:ref:`depolying-to-a-web-server` 部分。

.. toctree::
   :maxdepth: 2

   mod_wsgi
   wsgi-standalone
   uwsgi
   fastcgi
   cgi
