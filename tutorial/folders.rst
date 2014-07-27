.. _tutorial-folders:

步骤 0: 创建文件夹
============================

在我们真正开始之前，让我们创建这个应用所需的文件夹::

    /flaskr
        /static
        /templates

`flaskr` 文件夹不是一个 Python 包，只是个我们放置文件的地方。在接
下来的步骤中，我们会直接把数据库模式和主模块放在这个目录中。 
用户可以通过 `HTTP` 访问 `static` 文件夹中的文件，也即存放 css 和
javascript 文件的地方。Flask 会在 `templates` 文件夹里寻
找 `Jinja2`_ 模板，之后教程中创建的模板将会放在这个文件夹里。

阅读 :ref:`tutorial-schema` 以继续。

.. _Jinja2: http://jinja.pocoo.org
