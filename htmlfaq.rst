HTML/XHTML 常见问题
===================

Flask 文档和示例应用使用 HTML5 。你可能会注意到，在许多情况下当结束标签
是可选的时候，并不使用它们，这样 HTML 会更简洁且加载更迅速。因为在开发者
中，关于 HTML 和 XHTML 有许多混淆，本文档视图回答一些主要的疑问。


XHTML 的历史
----------------

一段时间， XHTML 的出现欲取代 HTML 。然而，Internet 上几乎没有任何实
际的 XHTML （用 XML 规则处理的 HTML ）网站。这种情况有几个主要的原因。
其一是 Internet Explorer 缺乏对 XHTML 妥善的支持。 XHTML 规范要求 XHTML
必须由 MIME 类型 `application/xhtml+xml` 来承载，但是 Internet Explorer
拒绝读取这个 MIME 类型下的文件。

而配置 Web 服务器来妥善地提供 XHTML 相对简单，很少人这么做。这也就是为什
么妥善地使用 XHTML 可能是相当痛苦的。

痛苦的最重要的原因之一是 XML 苛刻的（严格而残忍）错误处理。当 XML 处理中
遭遇错误时，浏览器会把一个丑陋的错误消息显示给用户，而不是尝试从错误中恢
并显示出能显示的。web 上大多数的 (X)HTML 生成基于非 XML 的模板引擎（比如
Flask 所使用的 Jinja）并不会防止你偶然创建无效的 XHTML 。也有基于 XML 的
模板引擎，诸如 Kid 和 流行的 Genshi，但是它们经常具有更大的运行时开销，
并且不能不能直接使用，因为它们要遵守 XML 规则。

大多数用户，不管怎样，假设它们正在妥善地使用 XHTML 。他们在文档的顶部写下
一个 XHTML doctype 并且闭合了所有必要闭合的标签（ 在 XHTML 中 ``<br>`` 要
写为 ``<br />`` 或 ``<br></br>`` ）。然而，即使文档可以妥善地通过 XHTML
验证，真正决定浏览器中 XHTML/HTML 处理的是前面说到的，不能被妥善设置的
MIME 类型。所以有效的 XHTML 会被视为有效的 HTML 处理。

XHTML 也改变了使用 JavaScript 的方式。要在 XHTML 妥善地工作，程序员不得不
使用带有 XHTML 名称空间的 DOM 接口来查询 HTML 元素。

HTML5 的历史
----------------

HTML5 规范的开发在 2004 年就以 “Web 应用1.0”之名由网页超文本技术工作小组
（Web Hypertext Application Technology Working Group），或 WHATWG（由主要
的浏览器供应商苹果、 Mozilla 以及 Opera 创立），目的是编写一个新的改良的
HTML 规范，基于现有的浏览器行为，而不是不切实际和不向后兼容的规范。

例如，在 HTML4 中 ``<title/Hello/`` 理论上与 ``<title>Hello</title>`` 处理
得完全相同。然而，由于人们已然使用了诸如 ``<link />`` 的 XHTML-like 标签，
浏览器供应商在规范语法之上实现了 XHTML 语法。

在 2007 年，这个标准被 W3C 收入一个新的 HTML 规范，也就是 HTML5 。现在，
随着 XHTML 2 工作组解散和 HTML5 被所有主流浏览器供应商实现，XHTML 正在失去
吸引力，

HTML 对 XHTML
-----------------

下面的表格给你一个 HTML 4.01 、 XHTML 1.1 和 HTML5 中可用特性的简要综述。
（不包括 XHTML 1.0 ，因为它被 XHTML 1.1 和几乎不使用的 XHTML5 代替 ）

.. tabularcolumns:: |p{9cm}|p{2cm}|p{2cm}|p{2cm}|

+-----------------------------------------+----------+----------+----------+
|                                         | HTML4.01 | XHTML1.1 | HTML5    |
+=========================================+==========+==========+==========+
| ``<tag/value/`` == ``<tag>value</tag>`` | |Y| [1]_ | |N|      | |N|      |
+-----------------------------------------+----------+----------+----------+
| ``<br/>`` supported                     | |N|      | |Y|      | |Y| [2]_ |
+-----------------------------------------+----------+----------+----------+
| ``<script/>`` supported                 | |N|      | |Y|      | |N|      |
+-----------------------------------------+----------+----------+----------+
| should be served as `text/html`         | |Y|      | |N| [3]_ | |Y|      |
+-----------------------------------------+----------+----------+----------+
| should be served as                     | |N|      | |Y|      | |N|      |
| `application/xhtml+xml`                 |          |          |          |
+-----------------------------------------+----------+----------+----------+
| strict error handling                   | |N|      | |Y|      | |N|      |
+-----------------------------------------+----------+----------+----------+
| inline SVG                              | |N|      | |Y|      | |Y|      |
+-----------------------------------------+----------+----------+----------+
| inline MathML                           | |N|      | |Y|      | |Y|      |
+-----------------------------------------+----------+----------+----------+
| ``<video>`` tag                         | |N|      | |N|      | |Y|      |
+-----------------------------------------+----------+----------+----------+
| ``<audio>`` tag                         | |N|      | |N|      | |Y|      |
+-----------------------------------------+----------+----------+----------+
| New semantic tags like ``<article>``    | |N|      | |N|      | |Y|      |
+-----------------------------------------+----------+----------+----------+

.. [1] 这是一个从 SGML 中继承过来的鲜为人知的特性。由于上述的原因，它通常不
       被浏览器支持。
.. [2] 这用于兼容生成 ``<br>`` 之类的服务器代码。它不应该在新代码中出现。
.. [3] XHTML 1.0 是考虑向后兼容，允许呈现为 `text/html` 的最后一个 XHTML 标
       准。

.. |Y| image:: _static/yes.png
       :alt: Yes
.. |N| image:: _static/no.png
       :alt: No

“严格”意味着什么？
------------------------

HTML5 严格地定义了处理规则，并准确地指定了一个浏览器应该如何应对处理中的错
误——不像 XHTML，只简单声明将要放弃处理。一些人因显然无效的语法仍生成期望中
结果而困惑（比如，缺失结尾标签或属性值未用引号包裹）。
HTML5 has strictly defined parsing rules, but it also specifies exactly
how a browser should react to parsing errors - unlike XHTML, which simply
states parsing should abort. Some people are confused by apparently
invalid syntax that still generates the expected results (for example,
missing end tags or unquoted attribute values).

这些工作是因为大多数浏览器遭遇一个标记错误时的错误处理是宽容的，其它的实际
上也指定了。下面的结构在 HTML5 标准中是可选的，但一定被浏览器支持:

-   用 ``<html>`` 标签包裹文档。
-   把页首元素包裹在 ``<head>`` 里或把主题元素包裹在 ``<body>`` 里。
-   闭合 ``<p>``, ``<li>``, ``<dt>``, ``<dd>``, ``<tr>``,
    ``<td>``, ``<th>``, ``<tbody>``, ``<thead>`` 或 ``<tfoot>`` 标签。
-   用引号包裹属性值，只要它们不含有空白字符或其特殊字符（比如 ``<`` 、
    ``>`` 、 ``'`` 或 ``"`` ）。
-   需要布尔属性来设定一个值。

这意味着下面的页面在 HTML5 中是完全有效的:

.. sourcecode:: html

    <!doctype html>
    <title>Hello HTML5</title>
    <div class=header>
      <h1>Hello HTML5</h1>
      <p class=tagline>HTML5 is awesome
    </div>
    <ul class=nav>
      <li><a href=/index>Index</a>
      <li><a href=/downloads>Downloads</a>
      <li><a href=/about>About</a>
    </ul>
    <div class=body>
      <h2>HTML5 is probably the future</h2>
      <p>
        There might be some other things around but in terms of
        browser vendor support, HTML5 is hard to beat.
      <dl>
        <dt>Key 1
        <dd>Value 1
        <dt>Key 2
        <dd>Value 2
      </dl>
    </div>


HTML5 中的新技术
-------------------------

HTML5 添加了许多新特性来使得 Web 应用易于编写和使用。

-   ``<audio>`` 和 ``<video>`` 标签提供了不使用 QuickTime 或 Flash 之类的
    复杂附件的嵌入音频和视频的方式。
-   像 ``<article>`` 、 ``<header>`` 、 ``<nav>`` 以及 ``<time>`` 之类的
    语义化元素，使得内容易于理解。
-   ``<canvas>`` 标签，支持强大的绘图 API ，减少了服务器端生成图像来图形化
    显示数据的必要。
-   新的表单控件类型，比如 ``<input type="data">`` 使得用户代理记录和验证
    其值更容易。
-   高级 JavaScript API ，诸如 Web Storage 、 Web Workers 、 Web Sockets 、
    地理位置以及离线应用。

除此之外，也添加了许多其它的特性。 Mark Pilgrim 即将出版的书
`Dive Into HTML5`_ 是 HTML5 中新特性的优秀入门书。并不是所有的这些特性已经
都被浏览器支持，无论如何，请谨慎使用。

.. _Dive Into HTML5: http://www.diveintohtml5.org/

应该使用什么？
--------------------

一般情况下，答案是 HTML 5 。考虑到 web 浏览器最新的开发，几乎没有理由再去
使用 XHTML 。总结上面给出的原因:

-   Internet Explorer （市场份额令人悲伤的领先） 对 XHTML 支持不佳。
-   许多 JavaScript 库也不支持 XHTML ，由于它需要复杂的命名空间 API 。
-   HTML 添加了数个新特性，包括语义标签和期待已久的 ``<audio>`` 和
    ``<video>`` 标签。
-   它背后获得了大多数浏览器供应商的支持。
-   它易于编写，而且更简洁。

对于大多数应用，使用 HTML5 无疑比 XHTML 要好。
