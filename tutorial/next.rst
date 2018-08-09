.. _keep-developing:

后续开发
================

至此，你已经掌握了一些 Flask 和 Python 概念。回顾教程中的各个步骤，与你编写的代码相
比较。由于本教程是逐步性质的，你的项目会与我们给出的
:gh:`示例项目 <examples/tutorial>` 有所出入。

尽管本教程远未覆盖 Flask 的全部特性，但现在的你已经具备了用 Flask 开发 Web 应用能力
了。你可以在 :ref:`quickstart` 部分概览 Flask 能做什么，然后由文档深入了解。Flask
幕后使用了 `Jinja`_ 、 `Click`_ 、`Werkzeug`_  和 `ItsDangerous`_ ，这几个库也有
自己的文档。你可能会对 :ref:`extensions` 感兴趣，扩展可以让你轻而易举地完成操作数据
库、验证表单数据之类的工作。

如果你要进行 Flaskr 项目的后续开发，这里给出了一些发展建议：

*   单篇文章的详情视图，由文章标题点击访问。
*   喜欢、取消喜欢一篇文章。
*   评论。
*   标签，点击标签可以显示该标签下的所有文章。
*   搜索框，根据文章标题过滤索引页中的文章。
*   分页，每页仅显示 5 篇文章。
*   上传文章附图。
*   支持 Markdown 格式的文章。
*   RSS Feed，用于发布新文章。

敬请享受 Flask，去构建令人神往的 Web 应用吧！

.. _Jinja: https://palletsprojects.com/p/jinja/
.. _Click: https://palletsprojects.com/p/click/
.. _Werkzeug: https://palletsprojects.com/p/werkzeug/
.. _ItsDangerous: https://palletsprojects.com/p/itsdangerous/
