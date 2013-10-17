.. _application-errors:

记录应用错误
==========================

.. versionadded:: 0.3

应用故障，服务器故障。早晚你会在产品中看见异常。即使你的代码是 100% 正确的，
你仍然会不时看见异常。为什么？因为涉及的所有一切都会出现故障。这里给出一些
完美正确的代码导致服务器错误的情况:

-   客户端在应用读取到达数据时，提前终止请求
-   数据库服务器超载，并无法处理查询
-   文件系统满了
-   硬盘损坏
-   后端服务器超载
-   你所用的库出现程序错误
-   服务器的网络连接或其它系统故障

而且这只是你可能面对的问题的简单情形。那么，我们应该怎么处理这一系列问题？
默认情况下，如果你的应用在以生产模式运行， Flask 会显示一个非常简单的页面并
记录异常到 :attr:`~flask.Flask.logger` 。

但是你还可以做些别的，我们会介绍一些更好的设置来应对错误。


错误邮件
-----------

如果你的应用在生产模式下运行（会在你的服务器上做），默认情况下，你不会看见
任何日志消息。为什么会这样？Flask 试图实现一个零配置框架。如果没有配置，日
志会存放在哪？猜测不是个好主意，因为它猜测的位置可能不是一个用户有权创建日
志文件的地方。而且，对于大多数小型应用，不会有人关注日志。

事实上，我现在向你保证，如果你给应用错误配置一个日志文件，你将永远不会去看
它，除非在调试问题时用户向你报告。你需要的应是异常发生时的邮件，然后你会得
到一个警报，并做些什么。

Flask 使用 Python 内置的日志系统，而且它确实向你发送你可能需要的错误邮件。
这里给出你如何配置 Flask 日志记录器向你发送报告异常的邮件::

    ADMINS = ['yourname@example.com']
    if not app.debug:
        import logging
        from logging.handlers import SMTPHandler
        mail_handler = SMTPHandler('127.0.0.1',
                                   'server-error@example.com',
                                   ADMINS, 'YourApplication Failed')
        mail_handler.setLevel(logging.ERROR)
        app.logger.addHandler(mail_handler)

那么刚刚发生了什么？我们创建了一个新的
:class:`~logging.handlers.SMTPHandler` 来用监听 ``127.0.0.1`` 的邮件服务器
向所有的 `ADMINS` 发送发件人为 *server-error@example.com* ，主题
为 "YourApplication Failed" 的邮件。如果你的邮件服务器需要凭证，这些功能也
被提供了。详情请见 :class:`~logging.handlers.SMTPHandler` 的文档。

我们同样告诉处理程序只发送错误和更重要的消息。因为我们的确不想收到警告或是
其它没用的，每次请求处理都会发生的日志邮件。

你在生产环境中运行它之前，请参阅 :ref:`logformat` 来向错误邮件中置放更多的
信息。这会让你少走弯路。


记录到文件
-----------------

即便你收到了邮件，你可能还是想记录警告。当调试问题的时候，收集更多的信息是个
好主意。请注意 Flask 核心系统本身不会发出任何警告，所以在古怪的事情发生时发
出警告是你的责任。

在日志系统的方框外提供了一些处理程序，但它们对记录基本错误并不是都有用。最让人
感兴趣的可能是下面的几个:

-   :class:`~logging.FileHandler` - 在文件系统上记录日志
-   :class:`~logging.handlers.RotatingFileHandler` - 在文件系统上记录日志，
    并且当消息达到一定数目时，会滚动记录
-   :class:`~logging.handlers.NTEventLogHandler` - 记录到 Windows 系统中的系
    统事件日志。如果你在 Windows 上做开发，这就是你想要用的。
-   :class:`~logging.handlers.SysLogHandler` - 发送日志到 Unix 的系统日志

当你选择了日志处理程序，像前面对 SMTP 处理程序做的那样，只要确保使用一个低级
的设置（我推荐 `WARNING` ）::

    if not app.debug:
        import logging
        from themodule import TheHandlerYouWant
        file_handler = TheHandlerYouWant(...)
        file_handler.setLevel(logging.WARNING)
        app.logger.addHandler(file_handler)

.. _logformat:

控制日志格式
--------------------------

默认情况下，错误处理只会把消息字符串记录到文件或邮件发送给你。一个日志记
录应存储更多的信息，这使得配置你的日志记录器包含那些信息很重要，如此你会
对错误发生的原因，还有更重要的——错误在哪发生，有更好的了解。

格式可以从一个格式化字符串实例化。注意回溯（tracebacks）会被自动加入到日
志条目后，你不需要在日志格式的格式化字符串中这么做。

这里有一些配置实例:

邮件
`````

::

    from logging import Formatter
    mail_handler.setFormatter(Formatter('''
    Message type:       %(levelname)s
    Location:           %(pathname)s:%(lineno)d
    Module:             %(module)s
    Function:           %(funcName)s
    Time:               %(asctime)s

    Message:

    %(message)s
    '''))

日志文件
````````````

::

    from logging import Formatter
    file_handler.setFormatter(Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'
    ))


复杂日志格式
``````````````````````

这里给出一个用于格式化字符串的格式变量列表。注意这个列表并不完整，完整的列
表请翻阅 :mod:`logging` 包的官方文档。

.. tabularcolumns:: |p{3cm}|p{12cm}|

+------------------+----------------------------------------------------+
| 格式             | 描述                                               |
+==================+====================================================+
| ``%(levelname)s``| 消息文本的记录等级                                 |
|                  | (``'DEBUG'``, ``'INFO'``, ``'WARNING'``,           |
|                  | ``'ERROR'``, ``'CRITICAL'``).                      |
+------------------+----------------------------------------------------+
| ``%(pathname)s`` | 发起日志记录调用的源文件的完整路径（如果可用）     |
+------------------+----------------------------------------------------+
| ``%(filename)s`` | 路径中的文件名部分                                 |
+------------------+----------------------------------------------------+
| ``%(module)s``   | 模块（文件名的名称部分）                           |
+------------------+----------------------------------------------------+
| ``%(funcName)s`` | 包含日志调用的函数名                               |
+------------------+----------------------------------------------------+
| ``%(lineno)d``   | 日志记录调用所在的源文件行的行号（如果可用）       |
+------------------+----------------------------------------------------+
| ``%(asctime)s``  | `LogRecord` 创建时的人类可读的时间。默认情况下，格 |
|                  | 式为 ``"2003-07-08 16:49:45,896"`` （逗号后的数字  |
|                  | 时间的毫秒部分）。这可以通过继承                   |
|                  | :class:~logging.Formatter，并                      |
|                  | 重载 :meth:`~logging.Formatter.formatTime` 改变。  |
+------------------+----------------------------------------------------+
| ``%(message)s``  | 记录的消息，视为 ``msg % args``                    |
+------------------+----------------------------------------------------+

如果你想深度定制日志格式，你可以继承 :class:~logging.Formatter。 
:class:~logging.Formatter 有三个需要
关注的方法:

:meth:`~logging.Formatter.format`:
    处理实际上的格式。需要一个 :class:`~logging.LogRecord` 对象作为参数，并
	必须返回一个格式化字符串。
:meth:`~logging.Formatter.formatTime`:
	控制 `asctime` 格式。如果你需要不同的时间格式，可以重载这个函数。
:meth:`~logging.Formatter.formatException`
	控制异常的格式。需要一个 :attr:`~sys.exc_info` 元组作为参数，并必须返
	回一个字符串。默认的通常足够好，你不需要重载它。

更多信息请见其官方文档。


其它的库
---------------

至此，我们只配置了应用自己建立的日志记录器。其它的库也可以记录它们。例如，
SQLAlchemy 在它的核心中大量地使用日志。而在 :mod:`logging` 包中有一个方法
可以一次性配置所有的日志记录器，我不推荐使用它。可能存在一种情况，当你想
要在同一个 Python 解释器中并排运行多个独立的应用时，则不可能对它们的日志
记录器做不同的设置。

作为替代，我推荐你找出你有兴趣的日志记录器，用 :func:`~logging.getLogger`
函数来获取日志记录器，并且遍历它们来附加处理程序::

    from logging import getLogger
    loggers = [app.logger, getLogger('sqlalchemy'),
               getLogger('otherlibrary')]
    for logger in loggers:
        logger.addHandler(mail_handler)
        logger.addHandler(file_handler)


调试应用错误
============================

对于生产应用，按照 :ref:`application-errors` 中的描述来配置你应用的日志记录和
通知。这个章节讲述了调试部署配置和深入一个功能强大的 Python 调试器的要点。


有疑问时，手动运行
---------------------------

在配置你的应用到生产环境时时遇到了问题？如果你拥有主机的 shell 权限，验证你
是否可以在部署环境中手动用 shell 运行你的应用。确保在同一用户账户下运行配置
好的部署来解决权限问题。你可以使用 Flask 内置的开发服务器并设置 `debug=True` ，
这在捕获配置问题的时候非常有效，但是 **请确保在可控环境下临时地这么做。** 不要
在生产环境中使用 `debug=True` 运行。

.. _working-with-debuggers:

调试器操作
----------------------

为了深入跟踪代码的执行，Flask 提供了一个方框外的调试器（见 :ref:`debug-mode` ）。
如果你想用其它的 Python 调试器，请注意相互的调试器接口。你需要设置下面的参数来
使用你中意的调试器:

* ``debug``        - 是否开启调试模式并捕获异常
* ``use_debugger`` - 是否使用内部的 Flask 调试器
* ``use_reloader`` - 是否在异常时重新载入并创建子进程

`debug` 必须为 True （即异常必须被捕获）来允许其它的两个选项设置为任何值。

如果你使用 Aptana/Eclipse 来调试，你会需要把 ``use_debugger`` 和 ``user_reloader``
都设置为 False 。

一个可能有用的配置模式就是在你的 config.yaml 中设置为如下（当然，自行更改为适用
你应用的）::

   FLASK:
       DEBUG: True
       DEBUG_WITH_APTANA: True

然后在你应用的入口（ main.py ），你可以写入下面的内容::

   if __name__ == "__main__":
       # To allow aptana to receive errors, set use_debugger=False
       app = create_app(config="config.yaml")

       if app.debug: use_debugger = True
       try:
           # Disable Flask's debugger if external debugger is requested
           use_debugger = not(app.config.get('DEBUG_WITH_APTANA'))
       except:
           pass
       app.run(use_debugger=use_debugger, debug=app.debug,
               use_reloader=use_debugger, host='0.0.0.0')
