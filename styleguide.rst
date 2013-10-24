Pocoo 风格指引
================

Pocoo 风格指引是所有 Pocoo 项目的风格指引，包括 Flask 。这份风格指引
在 Flask 补丁中是必须的，并且推荐在 Flask 扩展中使用。

一般而言， Pocoo 风格指引遵循 :pep:`8` ，有一些小差异和扩充。

总体布局
--------------

缩进:
  4个空格。没有制表符，没有例外。

最大行长:
  79字符，软限制是 84 ，如果绝对必要。尝试合理放置 `break` 、 `continue`
  和 `return` 声明来避免代码过度嵌套。

可续长语句:
  你可以使用反斜线来继续一个语句，在这种情况下，你应该对齐下一行到最后一个
  点或等号或缩进四个空格::

    this_is_a_very_long(function_call, 'with many parameters') \
        .that_returns_an_object_with_an_attribute

    MyModel.query.filter(MyModel.scalar > 120) \
                 .order_by(MyModel.name.desc()) \
                 .limit(10)

  如果你在一个带括号的语句中换行，对齐到括号::

    this_is_a_very_long(function_call, 'with many parameters',
                        23, 42, 'and even more')

  对于有许多元素的元组或列表，在起始括号后立即换行::

    items = [
        'this is the first', 'set of items', 'with more items',
        'to come in this line', 'like this'
    ]

空行:
  顶层函数和类由两个空行分隔，其它的东西由一行。不要使用太多的空行来分隔
  代码中的逻辑段。例如::

    def hello(name):
        print 'Hello %s!' % name


    def goodbye(name):
        print 'See you %s.' % name


    class MyClass(object):
        """This is a simple docstring"""

        def __init__(self, name):
            self.name = name

        def get_annoying_name(self):
            return self.name.upper() + '!!!!111'

表达式和语句
--------------------------

常规空格规则:
  - 不对不是单词的一元运算符使用空格（例如 ``-`` 、 ``~`` 等等），
    在圆括号内同样
  - 在二元运算符间使用空格

  好例子::

    exp = -1.05
    value = (item_value / item_count) * offset / exp
    value = my_list[index]
    value = my_dict['key']

  糟糕的例子::

    exp = - 1.05
    value = ( item_value / item_count ) * offset / exp
    value = (item_value/item_count)*offset/exp
    value=( item_value/item_count ) * offset/exp
    value = my_list[ index ]
    value = my_dict ['key']

不能使用 Yoda 语句:
  永远不要用常量与变量做比较，而是把变量与常量做比较:

  好例子::

    if method == 'md5':
        pass

  糟糕的例子::

    if 'md5' == method:
        pass

比较:
  - 跟任意类型: ``==`` 和 ``!=``
  - 跟单例，使用 ``is`` 和 ``is not`` （例如 ``foo is not
    None`` ）
  - 永远不要与 `True` 或 `False` 做比较（比如永远不要
    写 ``foo == False`` ，而是 ``not foo`` ）

否定包含检查:
  使用 ``foo not in bar`` 而不是 ``not foo in bar``

实例检查:
  用 ``isinstance(a, C)`` 而不是 ``type(A) is C`` ， 但通常试图避免
  实例检查，请对特性检查。


命名约定
------------------

- 类名: ``CamelCase`` ，缩写词大写 （ ``HTTPWriter``
  而非 ``HttpWriter`` ）
- 变量名: ``lowercase_with_underscores``
- 方法和函数名: ``lowercase_with_underscores``
- 常量: ``UPPERCASE_WITH_UNDERSCORES``
- 预编译正则表达式: ``name_re``

被保护的成员以单个下划线作为前缀，双下划线为混合类保留。

在带有关键字的类上，会添加结尾的下划线。与内置构件冲突是允许的，并且
**一定不要** 在用在变量名后添加下划线的方式解决。如果函数需要访问一个隐蔽
的内置构件，重绑定内置构件到一个不同的名字作为替代。

函数和方法参数:
  - 类方法: ``cls`` 作为第一个参数
  - 实例方法: ``self`` 作为第一个参数
  - 属性的 lambda 表达式应该把第一个参数替换为 ``x`` ，像 ``display_name = 
    property(lambda x: x.real_name or x.username)`` 中一样


文档字符串
----------

文档字符串约定:
  所有的文档字符串为 Sphinx 可理解的 reStructuredText 格式。它们的形态
  因行数不同而迥异。如果只有一行，闭合的三引号和开头的三引号在同一行，
  否则开头的三引号与文本在同一行，而闭合的三引号另起一行::

    def foo():
        """This is a simple docstring"""


    def bar():
        """This is a longer docstring with so much information in there
        that it spans three lines.  In this case the closing triple quote
        is on its own line.
        """

模块标头:
  模块标头包含一个 utf-8 编码声明（即使没有使用非 ASCII 字符，也始终推
  荐这么做）和一个标准的文档字符串::

    # -*- coding: utf-8 -*-
    """
        package.module
        ~~~~~~~~~~~~~~

        A brief description goes here.

        :copyright: (c) YEAR by AUTHOR.
        :license: LICENSE_NAME, see LICENSE_FILE for more details.
    """

  请留意合适的版权和许可证文件对于通过审核的 Flask 扩展是必须的。


注释
--------

注释的规则和文档字符串类似。两者都使用 reStructuredText 格式。如果一个
注释被用于一个属性的文档，在起始的井号（ ``#`` ）后加一个冒号::

    class User(object):
        #: the name of the user as unicode string
        name = Column(String)
        #: the sha1 hash of the password + inline salt
        pw_hash = Column(String)
