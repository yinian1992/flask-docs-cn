Flask 中的 Unicode
===================

Flask 与 Jinja2 、 Werkzeug 一样，文本方面完全基于 Unicode ，大多数 web 相关的 
Python 库同样这样处理文本。如果你还不知道 Unicode 是什么，可能需要阅读 
`The Absolute Minimum Every Software Developer Absolutely, 
Positively Must Know About Unicode and Character Sets
<http://www.joelonsoftware.com/articles/Unicode.html>`_ 。
这些文档对基本知识做了一些封装，保证你处理 Unicode 相关的事情有愉快的经历。

自动转换
--------------------

为了提供基本无痛的 Unicode 支持，Flask做了这些假设：

-   你网站上文本编码是 UTF-8
-   你在内部对文本始终只使用 Unicode ，除非是只有 ASCII 字符的字面量字符串
-   只要协议会话需要传送字节，都离不开编码和解码过程

所以，这对你来说有什么意义？

HTTP 是基于字节的，不仅是说协议，用于定位服务器文档的系统也是这样（即 URI
或 URL ）。然而，通常在 HTTP 上传送的 HTML 支持很多种字符集，并且需要在 HTTP 
header 中注明。为了避免不必要的复杂性， Flask 假设你发送的都是 UTF-8
编码的 Unicode，Flask 会为你完成编码工作，并设置适当的 header。

如果你使用 SQLAlchemy 或类似的 ORM 系统与数据库会话，道理也是同样的：一些数据库
已经使用传输 Unicode 的协议，即使没有，SQLALchemy 或其它 ORM 也会顾及到。

金科玉律
---------------

经验法则：如果你不需要处理二进制数据，请一律使用 Unicode 。在 Python 2.x 中，使用
Unicode 意味着什么？

-   使用 ASCII charpoints （基本是数字、非变音或非奇特的拉丁字母），你可以使用常规的
    字符串常量（ ``'Hello World'`` ）
-   如果你的字符串里有 ASCII 之外的东西，需要把这个字符串标记为 Unicode 字符串，
    方法是加上一个小写 `u` 的前缀（比如 ``u'Hänsel und Gretel'`` ）
-   如果你在 Python 文件中使用了非 Unicode 字符，你需要告诉 Python 你的文
    件使用了何种编码。我再次建议为此使用 UTF-8 。你可以在你 Python 源文件
    的第一行或第二行写入 ``# -*- coding: utf-8 -*-`` 来告知解释器你的编码
    类型。
-   Jinja 被配置为从 UTF-8 解码模板文件，所以确保你的编辑器也保存文件为 UTF-8 编码。

自行编解码
------------------------------

如果你的工作环境是一个不真正基于 Unicode 的文件系统之类的话，你需要确保使用 Unicode 接口妥善地解码。比如，当你想要在文件系统中加载一个文件，并嵌入到 Jinja2 模板时，
你需要按照文件的编码来解码。这里有一个老问题就是文本文件不指定有效的编码，
所以限定你在文本文件中使用 UTF-8 也是在帮自己的忙。

无论如何，以 Unicode 加载这样文件，你可以使用内置的 :meth:`str.decode` 方法::

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

-   Emacs: 使用 encoding cookie，或者把这段文字加入到你的 ``.emacs`` 配置文件::

        (prefer-coding-system 'utf-8)
        (setq default-buffer-file-coding-system 'utf-8)

-   Notepad++:

    1. 打开 *设置 -> 首选项 ...*
    2. 选择“新建”选项卡
    3. 选择“ UTF-8 无 BOM ”作为编码

    同样也建议使用 Unix 的换行格式，可以在相同的面板中选择，但不是必须的。
