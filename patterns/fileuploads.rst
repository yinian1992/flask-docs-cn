.. _uploading-files:

上传文件
===============

哦，上传文件可是个经典的好问题了。文件上传的基本概念实际上非常简单，
他基本是这样工作的:

1. 一个 ``<form>`` 标签被标记有 ``enctype=multipart/form-data`` ，并且
   在里面包含一个 ``<input type=file>`` 标签。
2. 服务端应用通过请求对象上的 :attr:`~flask.request.files` 字典访问文件。
3. 使用文件的 :meth:`~werkzeug.datastructures.FileStorage.save` 方法将文件永久地
   保存在文件系统上的某处。

一点点介绍
---------------------

让我们建立一个非常基础的小应用，这个小应用可以上传文件到一个指定的文件夹里，
然后将这个文件显示给用户。让我们看看这个应用的基础代码::

    import os
    from flask import Flask, request, redirect, url_for
    from werkzeug import secure_filename

    UPLOAD_FOLDER = '/path/to/the/uploads'
    ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

首先我们导入一些东西，大多数内容都是直接而容易的。:func:`werkzeug.secure_filename` 
将会在稍后进行解释。 `UPLOAD_FOLDER` 是我们储存上传的文件的地方，而 `ALLOWED_EXTENSIONS`
则是允许的文件类型的集合。然后我们手动为应用添加一个的 URL 规则。我们
通常很少这样做，但是为什么这里要如此呢？原因是我们希望实际部署的服务器
(或者我们的开发服务器）来为我们提供这些文件的访问服务，所以我们只需要
一个规则用来生成指向这些文件的 URL 。

为什么我们限制上传文件的后缀呢？您可能不希望您的用户能偶上传任何文件
到服务器上，如果服务器直接将数据发送给客户端。以这种方式，您可以确保
您的用户不能上传可能导致 XSS 问题(参考 :ref:`xss` )的 HTML 文件。也
确保会阻止 `.php` 文件以防其会被运行。当然，谁还会在服务器上安装
PHP 啊，是不是？ :)

下一步，就是检查文件类型是否有效、上传通过检查的文件、以及将用户重定向到
已经上传好的文件 URL 处的函数了::

    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

    @app.route('/', methods=['GET', 'POST'])
    def upload_file():
        if request.method == 'POST':
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return redirect(url_for('uploaded_file',
                                        filename=filename))
        return '''
        <!doctype html>
        <title>Upload new File</title>
        <h1>Upload new File</h1>
        <form action="" method=post enctype=multipart/form-data>
          <p><input type=file name=file>
             <input type=submit value=Upload>
        </form>
        '''

那么 :func:`~werkzeug.utils.secure_filename` 函数具体做了那些事呢？现在的问题
是，有一个信条叫做“永远别相信你用户的输入” ，这句话对于上传文件的文件名也是同样
有效的。所有提交的表单数据都可以伪造，而文件名本身也可能是危险的。在摄氏只需记住:
在将文件保存在文件系统之前，要坚持使用这个函数来确保文件名是安全的。

.. admonition:: 关于文件名安全的更多信息

   您对 :func:`~werkzeug.utils.secure_filename` 的具体工作和您没使用它会造成的后果
   感兴趣？试想一个人可以发送下列信息作为 `filename` 给您的应用::

      filename = "../../../../home/username/.bashrc"

   假定 ``../`` 的数量是正确的，而您会将这串字符与 `UPLOAD_FOLDER` 所指定的
   路径相连接，那么这个用户就可能有能力修改服务器文件系统上的一个文件，而他
   不应该拥有这种权限。这么做需要一些关于此应用情况的技术知识，但是相信我，
   骇客们都有足够的耐心 :)

   现在我们来研究一下这个函数的功能:

   >>> secure_filename('../../../../home/username/.bashrc')
   'home_username_.bashrc'

现在还有最后一件事没有完成: 提供对已上传文件的访问服务。 在 Flask 0.5 
以上的版本我们可以使用一个函数来实现此功能::

    from flask import send_from_directory

    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'],
                                   filename)

或者，您也可以选择为 `uploaded_file` 注册 `build_only` 规则，然后使用
:class:`~werkzeug.wsgi.SharedDataMiddleware` 类来实现下载服务。这种方法
同时支持更老版本的 Flask::

    from werkzeug import SharedDataMiddleware
    app.add_url_rule('/uploads/<filename>', 'uploaded_file',
                     build_only=True)
    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
        '/uploads':  app.config['UPLOAD_FOLDER']
    })

运行应用，不出意外的话，一切都应该像预期那样工作了。


改进上传功能
-----------------

.. versionadded:: 0.6

Flask 到底是如何处理上传的呢？如果服务器相对较小，那么他会先将文件储存在
网页服务器的内存当中。否则就将其写入一个临时未知(如函数 :func:`tempfile.gettempdir` 
返回的路径)。但是怎么指定一个文件大小的上限，当文件大于此限制，就放弃
上传呢? 默认 Flask 会很欢乐地使用无限制的空间，但是您可以通过在配置中设定 
``MAX_CONTENT_LENGTH`` 键的值来限制它::

    from flask import Flask, Request

    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

上面的代码将会把上传文件限制为最大 16 MB 。 如果请求传输一个更大的文件，
Flask 会抛出一个 :exc:`~werkzeug.exceptions.RequestEntityTooLarge` 异常。

这个特性是在 Flask 0.6 中被加入的，但是更老的版本也可以通过构建请求对象
的子类来实现。更多信息请查询 Werkzeug 文档中文件处理部分的内容。


上传进度条
--------------------

以前，很多开发者实现进度条的方法是这样的: 一边小块小块地读取传输来的文件，
一边将上传进度储存在数据库中，然后在通过客户端的 JavaScript 代码读取进度。
简单来说，客户端会每5秒钟询问服务器传输的进度。您感觉到这种讽刺了么？客户端
询问一些他本应该已经知道的事情。

Now there are better solutions to that work faster and more reliable.  The
web changed a lot lately and you can use HTML5, Java, Silverlight or Flash
to get a nicer uploading experience on the client side.  Look at the
following libraries for some nice examples how to do that:

现在有了一些性能更好、运行更可靠的解决方案。WEB 已经有了不少变化，现在您可以
使用 HTML5、Java、Silverlight 或者 Flash 来实现客户端更好的上传体验。看一看
下面列出的库的连接，可以找到一些很好的样例。

-   `Plupload <http://www.plupload.com/>`_ - HTML5, Java, Flash
-   `SWFUpload <http://www.swfupload.org/>`_ - Flash
-   `JumpLoader <http://jumploader.com/>`_ - Java


更简单解决方案
------------------

因为存在一个处理上传文件的范式，这个范式在大多数应用中机会不会有太大改变，
所以 Flask 存在一个扩展名为 `Flask-Uploads`_ ，这个扩展实现了一整套成熟的
文件上传架构。它提供了包括文件类型白名单、黑名单等多种功能。

.. _Flask-Uploads: http://packages.python.org/Flask-Uploads/
