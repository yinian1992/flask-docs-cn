基于 Celery 的后台任务
=============================

Celery 是一个 Python 的任务队列，包含线程/进程池。曾经有一个 Flask 的集成，
但在 Celery 3 重构了内部细节后变得不必要了。本指导补充了如何妥善在 Flask
中使用 Celery 的空白，但假设你已经读过了 Celery 官方文档中的教程
 `使用 Celery 的首要步骤
<http://docs.celeryproject.org/en/master/getting-started/first-steps-with-celery.html>`_

安装 Celery
-----------------

Celery 提交到了 Python Package Index (PyPI)，所以可以通过标准 Python 工具
``pip`` 或 ``easy_install`` 安装::

    $ pip install celery

配置 Celery
------------------

你需要的第一个东西是一个 Celery 实例，称为 Celery 应用。仅就 Celery 而言
其与 Flask 中的 :class:`~flask.Flask` 对象有异曲同工之妙。因为这个实例用
于你在 Celery 中做任何事——诸如创建任务和管理职程（Worker）——的入口点，
它必须可以在其它模块中导入。

例如，你可以把它放置到 ``tasks`` 模块中。虽然你可以在不重新配置 Flask 的
情况下使用 Celery，但继承任务、添加对 Flask 应用上下文的支持以及关联
Flask 配置会让情况变得更好。

这就是把 Celery 集成到 Flask 的全部必要步骤::

    from celery import Celery

    def make_celery(app):
        celery = Celery(app.import_name, broker=app.config['CELERY_BROKER_URL'])
        celery.conf.update(app.config)
        TaskBase = celery.Task
        class ContextTask(TaskBase):
            abstract = True
            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return TaskBase.__call__(self, *args, **kwargs)
        celery.Task = ContextTask
        return celery

该函数创建一个新的 Celery 对象，并用应用配置来配置中间人（Broker），
用 Flask 配置更新其余的 Celery 配置，之后在应用上下文中创建一个封装任务
执行的任务子类。

最简示例
---------------

通过上面的步骤，下面即是在 Flask 中使用 Celery 的最简示例::

    from flask import Flask

    app = Flask(__name__)
    app.config.update(
        CELERY_BROKER_URL='redis://localhost:6379',
        CELERY_RESULT_BACKEND='redis://localhost:6379'
    )
    celery = make_celery(app)


    @celery.task()
    def add_together(a, b):
        return a + b

这项任务可以在后台调用:

>>> result = add_together.delay(23, 42)
>>> result.wait()
65

运行 Celery 职程
-------------------------

现在如果你行动迅速，已经执行过了上述的代码，你会失望地得知 ``.wait()``
永远不会实际地返回。这是因为你也需要运行 Celery。你可以这样把 Celery
以职程运行::

    $ celery -A your_application worker

``your_application`` 字符串需要指向创建 `celery` 对象的应用所在包或模块。
