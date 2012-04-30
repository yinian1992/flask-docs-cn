Flask 中的 Unicode
===================

Flask 像 Jinja2 和 Werkzeug 一样，涉及到文本时，完全基于 Unicode 。不仅是
这些库，大多数 web 相关的 Python 库这样处理文本。如果你还不知道 Unicode
是什么，你可能需要阅读 `The Absolute Minimum Every Software Developer
Absolutely, Positively Must Know About Unicode and Character Sets
<http://www.joelonsoftware.com/articles/Unicode.html>`_ 。这部分文档试图
掩盖最基本的东西，使得你在 Unicode 相关的事情上有愉快的经历。

自动转换
--------------------

Flask 有一些关于你应用的假设（当然你可以更改）来给你基本的且无痛苦的
Unicode 支持:

-   你网站上文本的编码是 UTF-8
-   你在内部对文本始终只使用 Unicode ，除非是只有 ASCII 字符的字面量字符串
-   无论何时你使用需要传送字节的协议会话，编码和解码都会发生

所以这对你以为这什么？

HTTP 是基于字节的。不仅是协议，用于定位服务器上文档的系统也是这样（即 URI
或 URL ）。然而，通常在 HTTP 上传送的 HTML  支持种类繁多的字符集，并且用于
并在 HTTP header 中传输。为了不使这太复杂， Flask 假设你发出你想要的 UTF-8
编码的 Unicode 。 Flask 会为你编码并设置何时适当的标头。

当你通过 SQLAlchemy 或类似的 ORM 系统与数据库会话也是同样的。一些数据库有
传输 Unicode 的协议，而如果它们没有， SQLALchemy 或其它的 ORM 也会顾及到。

金科玉律
---------------

经验法则：如果你不处理二进制数据，请使用 Unicode 。在 Python 2.x 中，使用
Unicode 以为着什么？

-   只要你只在使用 ASCII charpoints （基本是数字、非变音或非奇特的拉丁字
    母），你可以使用常规的字符串常量（ ``'Hello World'`` ）
-   如果你需要在一个字符串里有 ASCII 之外的东西，你需要把这个字符串标记
    为 Unicode 字符串，方法是加上一个小写 `u` 的前缀（比如
    ``u'Hänsel und Gretel'`` ）
-   如果你在 Python 文件中使用了非 Unicode 字符，你需要告诉 Python 你的文
    件使用了何种编码。我再次建议为此使用 UTF-8 。你可以在你 Python 源文件
    的第一行或第二行写入 ``# -*- coding: utf-8 -*-`` 来告知解释器你的编码
    类型。
-   Jinja 被配置为从 UTF-8 解码模板文件。所以确保你的编辑器也保存文件为
    UTF-8 编码。

自行编解码
------------------------------

如果你在于一个不真正基于 Unicode 的文件系统或别的什么东西会话，你需要确保
你在使用 Unicode 接口工作时妥善地解码。所以，比如当你想要在文件系统中加载
一个文件，并嵌入到 Jinja2 模板是，你需要按照文件的编码来解码。这里有一个
老问题就是文本文件不指定有效的编码，所以限定你在文本文件中使用 UTF-8 会帮
你自己一个忙。

无论如何，以 Unicode 加载这样文件，你可以使用内置的 :meth:`str.decode` 方
法::

    def read_file(filename, charset='utf-8'):
        with open(filename, 'r') as f:
            return f.read().decode(charset)

从 Unicode 转换成指定的字符集，你可以使用 :meth:`unicode.encode` 方法::

    def write_file(filename, contents, charset='utf-8'):
        with open(filename, 'w') as f:
            f.write(contents.encode(charset))

配置编辑器
-------------------

现在的大多数编辑器默认存储为 UTF-8 ，但是如果你的编辑器没有配置为这样，你
需要更改它。这里是设置你编辑器存储为 UTF-8 的通用做法:

-   Vim: 在你的 ``.vimrc`` 文件中加入 ``set enc=utf-8`` 

-   Emacs: 使用编码 cookie 或把这放入到你的 ``.emacs`` 文件::

        (prefer-coding-system 'utf-8)
        (setq default-buffer-file-coding-system 'utf-8)

-   Notepad++:

    1. 打开 *设置 -> 首选项 ...*
    2. 选择“新建”选项卡
    3. 选择“ UTF-8 无 BOM ”作为编码

    同样也建议使用 Unix 的换行格式，可以在相同的面板中选择，但不是必须的。
