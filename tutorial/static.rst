.. _static-files:

静态文件
============

认证视图和模板现在已经正常运转了，但是它们的外观实在是太朴素了。那么忽悠需要用 `CSS`_
为你构造好的 HTML 布局添加样式了。样式本身不是动态的，所以对于模板而言，这是一个
*静态* 文件。

Flask 自动添加 ``static`` 视图来处理 ``flaskr/static`` 目录下的静态文件。之前在
``base.html`` 中，已经写好了 ``style.css`` 文件的链接：

.. code-block:: html+jinja

    {{ url_for('static', filename='style.css') }}

除了 CSS，也会用到其他类型的静态文件，比如 Javascript 函数、Logo 图片等等。把这些文
件放置在 ``flaskr/static`` 目录下，然后用 ``url_for('static', filename='...')``
即可引用到它们。

本教程并不关注如何编写 CSS，所以你可以直接复制下面的 CSS 到
``flaskr/static/style.css`` 文件里：

.. code-block:: css
    :caption: ``flaskr/static/style.css``

    html { font-family: sans-serif; background: #eee; padding: 1rem; }
    body { max-width: 960px; margin: 0 auto; background: white; }
    h1 { font-family: serif; color: #377ba8; margin: 1rem 0; }
    a { color: #377ba8; }
    hr { border: none; border-top: 1px solid lightgray; }
    nav { background: lightgray; display: flex; align-items: center; padding: 0 0.5rem; }
    nav h1 { flex: auto; margin: 0; }
    nav h1 a { text-decoration: none; padding: 0.25rem 0.5rem; }
    nav ul  { display: flex; list-style: none; margin: 0; padding: 0; }
    nav ul li a, nav ul li span, header .action { display: block; padding: 0.5rem; }
    .content { padding: 0 1rem 1rem; }
    .content > header { border-bottom: 1px solid lightgray; display: flex; align-items: flex-end; }
    .content > header h1 { flex: auto; margin: 1rem 0 0.25rem 0; }
    .flash { margin: 1em 0; padding: 1em; background: #cae6f6; border: 1px solid #377ba8; }
    .post > header { display: flex; align-items: flex-end; font-size: 0.85em; }
    .post > header > div:first-of-type { flex: auto; }
    .post > header h1 { font-size: 1.5em; margin-bottom: 0; }
    .post .about { color: slategray; font-style: italic; }
    .post .body { white-space: pre-line; }
    .content:last-child { margin-bottom: 0; }
    .content form { margin: 1em 0; display: flex; flex-direction: column; }
    .content label { font-weight: bold; margin-bottom: 0.5em; }
    .content input, .content textarea { margin-bottom: 1em; }
    .content textarea { min-height: 12em; resize: vertical; }
    input.danger { color: #cc2f2e; }
    input[type=submit] { align-self: start; min-width: 10em; }

你可以在 :gh:`示例代码 <examples/tutorial/flaskr/static/style.css>` 里找到
非紧凑版本的 ``style.css`` 。

此后访问 http://127.0.0.1:5000/auth/login ，页面应该与下面的截图一样了。。

.. image:: flaskr_login.png
    :align: center
    :class: screenshot
    :alt: screenshot of login page

更多关于 CSS 的内容见 `Mozilla 的 CSS 文档 <CSS_>`_ 。修改静态文件后，刷新浏览器页
面即可。如果修改没有即时生效，请尝试清空浏览器缓存。

.. _CSS: https://developer.mozilla.org/docs/Web/CSS

继续阅读 :doc:`blog` 部分。
