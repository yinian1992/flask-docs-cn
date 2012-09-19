数据流
==================

有时，您希望发送非常巨量的数据到客户端，远远超过您可以保存在内存中的量。
在您实时地产生这些数据时，如何才能直接把他发送给客户端，而不需要在文件
系统中中转呢?

答案是生成器和 Direct Response。

基本使用
-----------

下面是一个简单的视图函数，这一视图函数实时生成大量的 CSV 数据，
这一技巧使用了一个内部函数，这一函数使用生成器来生成数据，并且
稍后激发这个生成器函数时，把返回值传递给一个 response 对象::

    from flask import Response

    @app.route('/large.csv')
    def generate_large_csv():
        def generate():
            for row in iter_all_rows():
                yield ','.join(row) + '\n'
        return Response(generate(), mimetype='text/csv')

每一个 ``yield`` 表达式直接被发送给浏览器。现在，仍然有一些 WSGI 中间件可能
打断数据流，所以在这里请注意那些在带缓存快照的调试环境，以及其他一些您可能
激活了的东西。

在模板中生成流
------------------------

Jinja2 模板引擎同样支持分块逐个渲染模板。Flask 没有直接暴露这一功能到
模板中，因为它很少被用到，但是您可以很轻易的自己实现::

    from flask import Response

    def stream_template(template_name, **context):
        app.update_template_context(context)
        t = app.jinja_env.get_template(template_name)
        rv = t.stream(context)
        rv.enable_buffering(5)
        return rv

    @app.route('/my-large-page.html')
    def render_large_template():
        rows = iter_all_rows()
        return Response(stream_template('the_template.html', rows=rows))

这一技巧是从应用程序上的 Jinja2 的环境中得到那个模板对象，然后调用
:meth:`~jinja2.Template.stream` 函数而不是 :meth:`~jinja2.Template.render`
函数。前者返回的是一个流对象，而不是后者的字符串。因为我们绕过了 Flask
的模板渲染函数，而是直接使用了模板对象，所以我们手动必须调用
:meth:`~flask.Flask.update_template_context` 函数来确保更新了模板的渲染上下文。
这一模板随后以流的方式迭代直到结束。因为每一次您使用使用一个 yield 。服务器
都会将所有的已经产生的内容塞给给客户端，因可能希望在模板中缓冲一部分元素
之后再发送，而不是每次都直接发送。您可以使用 ``rv.enable_buffering(size)`` 
来实现，size 的较为合理的默认值是 ``5`` 。
