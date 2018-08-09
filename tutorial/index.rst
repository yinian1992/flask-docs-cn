.. _tutorial:

教程
========

.. toctree::
    :caption: Contents:
    :maxdepth: 1

    layout
    factory
    database
    views
    templates
    static
    blog
    install
    tests
    deploy
    next

本教程会逐步指导你创建一个名为 Flaskr 的、具备基本功能的博客应用。用户可以在这个应用
上注册、登入并发表文章、编辑或删除自己的文章。之后也可以打包应用，并在安装到其他计算机
上。

.. image:: flaskr_index.png
    :align: center
    :class: screenshot
    :alt: 首页截图

本教程假定你已经可以熟练使用 Python。或者也可以先阅读 Python 文档中的 `官方教程`_
来学习 Python。

.. _官方教程: https://docs.python.org/3/tutorial/


本教程仅是给出一个合适的出发点，所以不会覆盖所有 Flask 的特性。在 :ref:`quickstart`
章节概览用 Flask 能做什么，然后深入文档寻找更多细节。本教程只会使用 Flask 和 Python
本身提供的功能。在其他项目里，你可能会用到 :ref:`extensions` 或是别的第三方库来让你
你的任务更为轻松。

.. image:: flaskr_login.png
    :align: center
    :class: screenshot
    :alt: 登入页截图

Flask 非常灵活，它不限定你采用特定的项目或代码布局。尽管如此，在一开始的时候还是尽量
用比较结构化的方式。这就是为什么本教程需要预先准备一套代码模板，并且已经为新手规避了
许多常见的陷阱。而在你熟悉了 Flask 之后，你就可以尝试其他结构，充分利用 Flask 的灵活
性。

.. image:: flaskr_edit.png
    :align: center
    :class: screenshot
    :alt: 编辑页截图

如果你想在完成教程后验证一下最终结果，可以在 :gh:`Flask 代码仓库的示例文件夹
<examples/tutorial>` 中找到本教程项目的源码。

请继续阅读 :doc:`layout` 。
