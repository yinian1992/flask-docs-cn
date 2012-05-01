.. _fabric-deployment:

使用 Fabric 部署
=====================

`Fabric`_ 是一个 Python 下类似于 Makefiles 的工具，但是能够在远程服务器上
执行命令。如果您有一个良好配置过的 Python 软件包 (:ref:`larger-applications`) 且
对“配置”概念的理解良好，那么在外部服务器上部署 Flask 应用将会非常容易。

开始之前，请先检查如下列表中的事项是否都已经满足了:

-   在本地已经安装了 Fabric 1.0 。即这个教程完成时， Fabric 的最新版本。
-   应用程序已经被封装为包的形式，而且有一个有效的 `setup.py` 文件
    (参考 :ref:`distribute-deployment`)。
-   在下文中的例子里，我们使用 `mod_wsgi` 作为远程服务器使用的服务端程序。
    您当然也可以使用您喜欢的服务端程序，但是考虑到 Apache 和 `mod_wsgi` 的
    组合非常简单易用且容易安装配置，并且在无 root 权限的情况下，存在一个比较
    简单的方法来重启服务器。

创建第一个 Fabfile
--------------------------

Fabfile 用于指定 Fabric 执行的命令，它通常被命名为 `fabfile.py` 并使用 `fab` 
命令运行。文件中所有的函数将被当做 `fab` 的子命令显示出来，他们可以在一个或
多个主机上运行。这些主机要么在 fabfile 当中定义，要么在命令输入时指定。在本文中
我们将他们定义在 fabfile 里。

这是第一个基础的例子，能够将现有源代码上传到指定服务器并将它们安装进如
一个已经存在的虚拟环境中::

    from fabric.api import *

    # 远程服务器登陆使用的用户名
    env.user = 'appuser'
    # 需要进行操作的服务器地址
    env.hosts = ['server1.example.com', 'server2.example.com']

    def pack():
        # 以 tar 归档的方式创建一个新的代码分发
        local('python setup.py sdist --formats=gztar', capture=False)

    def deploy():
        # 之处发布产品的名称和版本
        dist = local('python setup.py --fullname', capture=True).strip()
        # 将代码归档上传到服务器当中的临时文件夹内
        put('dist/%s.tar.gz' % dist, '/tmp/yourapplication.tar.gz')
        # 创建一个文件夹，进入这个文件夹，然后将我们的归档解压到那里
        run('mkdir /tmp/yourapplication')
        with cd('/tmp/yourapplication'):
            run('tar xzf /tmp/yourapplication.tar.gz')
            # 使用我们虚拟环境下的 Python 解释器安装我们的包
            run('/var/www/yourapplication/env/bin/python setup.py install')
        # 现在我们的代码已经部署成功了，可以删除这个文件夹了
        run('rm -rf /tmp/yourapplication /tmp/yourapplication.tar.gz')
        # 最终生成 .wsgi 文件，以便于 mod_wsgi 重新加载应用程序
        run('touch /var/www/yourapplication.wsgi')

上面的代码例子注释很清晰，应该很容易明白，下面是 fabric 常用命令的一个归纳:

-   `run` - 在远程服务器上执行所有命令
-   `local` - 在本地执行所有命令
-   `put` - 将指定文件上传到指定服务器
-   `cd` - 改变远程服务器当上的当前操作目录，此命令必须与 `with` 声明一起使用

运行 Fabfile
----------------

如何执行 fabfile 呢？您应该使用 `fab` 命令。若要发布当前版本的代码到远程
服务器上，您只需执行如下命令::

    $ fab pack deploy

然而这需要您的服务器已经创建过 ``/var/www/yourapplication`` 文件夹
而且 ``/var/www/yourapplication/env`` 是一个可用的虚拟环境。而且，
我们还没有在服务器上创建配置文件或者 `.wsgi` 文件。因此，我们怎么样
把一个新的服务器转换为可以使用基础设备呢。

这视我们想要配置的服务器数量的不同，实现起来有所差别。如果我们只有一个
远程应用服务器(大部分应用都是都属于此类)，那么 fabfile 里添加一个专门
负责此类的命令有些小题大做。但是显然我们可以这么做。在这里，您可以会
运行命令 `setup` 或者 `bootstrap` 。然后将服务器的地址详细地在命令行
当中指定::

    $ fab -H newserver.example.com bootstrap

初始化一个新的服务器，您大概需要执行如下几个步骤:

1.  在 ``/var/www`` 目录下创建目录结构::

        $ mkdir /var/www/yourapplication
        $ cd /var/www/yourapplication
        $ virtualenv --distribute env

2.  上传一个新的 `application.wsgi` 文件以及为应用程序准备的配置
    文件(例如: `application.cfg`)等到服务器上

3.  为 `yourapplication` 创建一个新的 Apache 配置，并激活它。请确保
    激活了对 `.wsgi` 改变的监视功能，这样在我们创建或改变这个文件时
    Apache 可以自动重新加载应用 (详细内容请参考 :ref:`mod_wsgi-deployment`)

现在的问题是， `application.wsgi` 和 `application.cfg` 文件
从何而来。

WSGI 文件
-------------

WSGI 文件应导入这个应用并且设定一个环境变量，这个环境变量指定了应用程序应
到哪里寻找配置文件。下面是一个完全完成上述功能的短例::



    import os
    os.environ['YOURAPPLICATION_CONFIG'] = '/var/www/yourapplication/application.cfg'
    from yourapplication import app

应用程序本身则应该向下面这样，通过查询环境变量来查找配置，以此初始化自己::

    app = Flask(__name__)
    app.config.from_object('yourapplication.default_config')
    app.config.from_envvar('YOURAPPLICATION_CONFIG')

这种方法在本文档的 :ref:`config` 这节中进行了详细介绍。

配置文件
----------------------

正如上文所属，应用程序将会通过查找 `YOURAPPLICATION_CONFIG` 环境变量以
找到正确的配置文件。因此我们必须将配置文件放在应用程序可以找到的地方。
配置文件有在不同电脑上表现出不同效果的特质，所以您不应该以普通的方式
对它进行版本控制。

一个流行的做法是将不同服务器的配置文件保存在不同的版本控制仓库里，然后
在不同的服务器中分别抽取出来。然后建立到从配置应该在的地点
(如: ``/var/www/yourapplication``)到这个文件实际位置的符号链接。

我们预计只有一个或两个服务器需要部署，因此我们采用另一种方法，也就是
提前手动将配置文件上传到需要的未知。

第一次部署
----------------

现在我们可以开始进行第一次部署了。我们已经初始化了服务器以使它拥有正确的
虚拟环境和已经激活的 Apache 配置文件。现在我们可以把应用打包然后部署了::

    $ fab pack deploy

Fabric 现在就会连接到所有服务器，然后运行在 fabfile 文件中所指定的命令。
最初他会执行打包工作，为我们创建代码归档，然后他部署和上传代码到所有的
服务器，并在那里安装他们。归功于 `setup.py` ，所有引用依赖的包和库都将
自动被下载和安装到我们的虚拟环境中。

下一步操作
----------

从现在开始，我们可以做的事情变得如此之多，以至于部署代码实际上可以
看做一种乐趣:

-   创建一个 `bootstrap` 命令用于初始化新的服务器，它将初始化一个新的虚拟环境
    安装以及适当配置 Apache 等。 
-   将配置文件放置到一个独立的版本控制仓库里，然后将活动的配置符号连接到
    它应该在的地方。
-   您应该将您的应用程序也放置到一个版本控制仓库中，然后在服务器中提取
    最新的版本并安装，您也可以很容易的回溯到以前的版本。
-   为测试提供函数接口，这样您就可以将测试代码部署到服务器上并在服务器端
    执行测试套件。

使用 Fabric 是相当有趣，而您会注意到键入 ``fab deploy`` 之后看到您的应用自动
部署到一个或多个服务器上看起来简直像是魔术。


.. _Fabric: http://fabfile.org/
