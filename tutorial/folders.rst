.. _tutorial-folders:

步骤 0: 创建文件夹
============================

在我们开始之前，让我们创建这个应用需要的文件夹::

    /flaskr
        /static
        /templates

`flaskr` 文件夹不是一个 python 包，只是我们放置文件的地方。在接下来的步骤中，我们会直接把数据库模式和主模块放在这个目录中。 可以应用用户通过 `HTTP` 访问`static` 文件夹中的文件，这也是 css 和 javascript 文件存放的地方。在 `templates` 文件夹里， Flask 会寻找 `Jinja2`_ 模板，你之后教程中创建的模板会放在这一文件夹里。

继续 :ref:`tutorial-schema`.

.. _Jinja2: http://jinja.pocoo.org/2/
