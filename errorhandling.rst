.. _application-errors:

记录应用错误
==========================

.. versionadded:: 0.3

应用故障，服务器故障。早晚你会在产品中看见异常。即使你的代码是 100% 正确的，
你仍然会不时看见异常。为什么？因为涉及的所有一切都会出现故障。这里给出一些
完美正确的代码导致服务器错误的情况:

-   客户端在应用读取到达数据时，提前终止请求
-   数据库服务器超载，并无法处理查询
-   满的文件系统
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

事实上，我现在向你保证，如果你给应用错误配置一个日志文件，你将永远不会看见
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
向所有地址中所有的 `ADMINS` 发送发件人为 *server-error@example.com* ，主题
为 "YourApplication Failed" 的邮件。如果你的邮件服务器需要凭证，这些功能也
被提供了。详情请见 :class:`~logging.handlers.SMTPHandler` 的文档。

我们同样告诉处理器只发送错误和更重要的消息。因为我们的确不想收到警告或是其
它没用的，每次请求处理都会发生的日志邮件。

你在生产环境中运行它之前，请参阅 :ref:`logformat` 来向错误邮件中置放更多的
信息。这会让你少走弯路。


记录到文件
-----------------

即便你收到了邮件，你可能还是想记录警告。当调试问题的时候，收集更多的信息是个
好主意。请注意 Flask 核心系统本身不会发出任何警告，所以在古怪的事情发生时发
出警告是你的责任。

在日志系统的方框外提供了一些处理器，但它们对记录基本错误并不是都有用。最让人
感兴趣的可能是下面的几个:

-   :class:`~logging.FileHandler` - 在文件系统上记录日志
-   :class:`~logging.handlers.RotatingFileHandler` - 在文件系统上记录日志，
    并且当消息达到一定数目时，会滚动记录
-   :class:`~logging.handlers.NTEventLogHandler` - 记录到 Windows 系统中的系
    统事件日志。如果你在 Windows 上做开发，这就是你想要用的。
-   :class:`~logging.handlers.SysLogHandler` - 发送日志到 Unix 的系统日志

当你选择了日志处理器，像前面对 SMTP 处理器做的那样，只要确保使用一个低级的设
置（我推荐 `WARNING` ）::

    if not app.debug:
        import logging
        from themodule import TheHandlerYouWant
        file_handler = TheHandlerYouWant(...)
        file_handler.setLevel(logging.WARNING)
        app.logger.addHandler(file_handler)

.. _logformat:

控制日志格式
--------------------------

By default a handler will only write the message string into a file or
send you that message as mail.  A log record stores more information,
and it makes a lot of sense to configure your logger to also contain that
information so that you have a better idea of why that error happened, and
more importantly, where it did.

A formatter can be instantiated with a format string.  Note that
tracebacks are appended to the log entry automatically.  You don't have to
do that in the log formatter format string.

Here some example setups:

Email
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

File logging
````````````

::

    from logging import Formatter
    file_handler.setFormatter(Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'
    ))


Complex Log Formatting
``````````````````````

Here is a list of useful formatting variables for the format string.  Note
that this list is not complete, consult the official documentation of the
:mod:`logging` package for a full list.

.. tabularcolumns:: |p{3cm}|p{12cm}|

+------------------+----------------------------------------------------+
| Format           | Description                                        |
+==================+====================================================+
| ``%(levelname)s``| Text logging level for the message                 |
|                  | (``'DEBUG'``, ``'INFO'``, ``'WARNING'``,           |
|                  | ``'ERROR'``, ``'CRITICAL'``).                      |
+------------------+----------------------------------------------------+
| ``%(pathname)s`` | Full pathname of the source file where the         |
|                  | logging call was issued (if available).            |
+------------------+----------------------------------------------------+
| ``%(filename)s`` | Filename portion of pathname.                      |
+------------------+----------------------------------------------------+
| ``%(module)s``   | Module (name portion of filename).                 |
+------------------+----------------------------------------------------+
| ``%(funcName)s`` | Name of function containing the logging call.      |
+------------------+----------------------------------------------------+
| ``%(lineno)d``   | Source line number where the logging call was      |
|                  | issued (if available).                             |
+------------------+----------------------------------------------------+
| ``%(asctime)s``  | Human-readable time when the LogRecord` was        |
|                  | created.  By default this is of the form           |
|                  | ``"2003-07-08 16:49:45,896"`` (the numbers after   |
|                  | the comma are millisecond portion of the time).    |
|                  | This can be changed by subclassing the formatter   |
|                  | and overriding the                                 |
|                  | :meth:`~logging.Formatter.formatTime` method.      |
+------------------+----------------------------------------------------+
| ``%(message)s``  | The logged message, computed as ``msg % args``     |
+------------------+----------------------------------------------------+

If you want to further customize the formatting, you can subclass the
formatter.  The formatter has three interesting methods:

:meth:`~logging.Formatter.format`:
    handles the actual formatting.  It is passed a
    :class:`~logging.LogRecord` object and has to return the formatted
    string.
:meth:`~logging.Formatter.formatTime`:
    called for `asctime` formatting.  If you want a different time format
    you can override this method.
:meth:`~logging.Formatter.formatException`
    called for exception formatting.  It is passed an :attr:`~sys.exc_info`
    tuple and has to return a string.  The default is usually fine, you
    don't have to override it.

For more information, head over to the official documentation.


Other Libraries
---------------

So far we only configured the logger your application created itself.
Other libraries might log themselves as well.  For example, SQLAlchemy uses
logging heavily in its core.  While there is a method to configure all
loggers at once in the :mod:`logging` package, I would not recommend using
it.  There might be a situation in which you want to have multiple
separate applications running side by side in the same Python interpreter
and then it becomes impossible to have different logging setups for those.

Instead, I would recommend figuring out which loggers you are interested
in, getting the loggers with the :func:`~logging.getLogger` function and
iterating over them to attach handlers::

    from logging import getLogger
    loggers = [app.logger, getLogger('sqlalchemy'),
               getLogger('otherlibrary')]
    for logger in loggers:
        logger.addHandler(mail_handler)
        logger.addHandler(file_handler)


Debugging Application Errors
============================

For production applications, configure your application with logging and
notifications as described in :ref:`application-errors`.  This section provides
pointers when debugging deployment configuration and digging deeper with a
full-featured Python debugger.


When in Doubt, Run Manually
---------------------------

Having problems getting your application configured for production?  If you
have shell access to your host, verify that you can run your application
manually from the shell in the deployment environment.  Be sure to run under
the same user account as the configured deployment to troubleshoot permission
issues.  You can use Flask's builtin development server with `debug=True` on
your production host, which is helpful in catching configuration issues, but
**be sure to do this temporarily in a controlled environment.** Do not run in
production with `debug=True`.


.. _working-with-debuggers:

Working with Debuggers
----------------------

To dig deeper, possibly to trace code execution, Flask provides a debugger out
of the box (see :ref:`debug-mode`).  If you would like to use another Python
debugger, note that debuggers interfere with each other.  You have to set some
options in order to use your favorite debugger:

* ``debug``        - whether to enable debug mode and catch exceptinos
* ``use_debugger`` - whether to use the internal Flask debugger
* ``use_reloader`` - whether to reload and fork the process on exception

``debug`` must be True (i.e., exceptions must be caught) in order for the other
two options to have any value.

If you're using Aptana/Eclipse for debugging you'll need to set both
``use_debugger`` and ``use_reloader`` to False.

A possible useful pattern for configuration is to set the following in your
config.yaml (change the block as appropriate for your application, of course)::

   FLASK:
       DEBUG: True
       DEBUG_WITH_APTANA: True

Then in your application's entry-point (main.py), you could have something like::

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
