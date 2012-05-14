添加 Favicon
================

“Favicon” 是指您的网页浏览器显示在标签页或者历史记录里的图标。
这个图标能帮助用户将您的网站与其他网站区分开，因此请使用一个
独特的标志

一个普遍的问题是如何将一个 Favicon 添加到您的 Flask 应用中。首先，您当然得
先有一个可用的图标，此图标应该是 16 x 16 像素的，且格式为 ICO 。这些虽然不是
必需的规则，但是是被所有浏览器所支持的事实标准。将这个图标放置到您的静态文件
目录下，文件名为 :file:`favicon.ico` 。

现在，为了让浏览器找到您的图标，正确的方法是添加一个 Link 标签到 HTML 当中
例如:

.. sourcecode:: html+jinja

    <link rel="shortcut icon" href="{{ url_for('static', filename='favicon.ico') }}">

对于大多数浏览器来说，这就足够了。然后一些非常老的浏览器不支持这个标准。
原来的标准是在网站的根路径下，查找 favicon 文件，并使用它。如果应用程序
不是挂在在域名的根路径，您要么需要配置 Web 服务器来在根路径提供这一图标，
要么您就很不幸地无法实现这一功能了。然而，如果您饿应用是在根路径，您就可以
简单的配置一条重定向的路由::

    app.add_url_rule('/favicon.ico',
                     redirect_to=url_for('static', filename='favicon.ico'))

如果想要保存额外的重定向请求，您也可以使用 :func:`~flask.send_from_directory` 
函数写一个视图函数::

    import os
    from flask import send_from_directory

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'),
                                   'favicon.ico', mimetype='image/vnd.microsoft.icon')

我们可以不详细指定 mimetype ，浏览器将会自行猜测文件的类型。但是我们也可以
指定它以便于避免额外的猜测，因为这个 mimetype 总是固定的。

以上的代码将会通过您的应用程序来提供图标文件的访问。然而，如果可能的话
配置您的网页服务器来提供访问服务会更好。请参考对应网页服务器的文档。

参考
--------

* Wikipedia 上有关 `Favicon <http://en.wikipedia.org/wiki/Favicon>`_ 的文章
  
