.. _tutorial-introduction:

介绍 Flaskr
==================

这里，我们把我们的博客应用称为 flaskr ，也可以选一个不那么 web 2.0 的名字 ;) 。基本上，我们希望它能做如下的事情：

1. 根据配置文件里的凭证允许用户登入登出。只支持一个用户。
2. 当用户登入后，可以向页面添加条目。条目标题是纯文本，正文可以是一些 HTML 。因假定信任这里的用户，这部分 HTML 不做审查。
3. 页面倒序显示所有条目（后来居上），并且用户登入后可以在此添加新条目。

我们将会在应用中直接使用 SQLite3 ，因为它对这种规模的应用足够适用。对于更大型的应用，就有必要使用 `SQLAlchemy`_ 更加智能地处理数据库连接、允许你一次连接不同的关系数据库等等。你也可以考虑流行的 NoSQL 数据库，如果你的数据更适合它们。

这里是一个应用最终效果的截图:

.. image:: ../_static/flaskr.png
   :align: center
   :class: screenshot
   :alt: screenshot of the final application

继续 :ref:`tutorial-folders` 。

.. _SQLAlchemy: http://www.sqlalchemy.org/
