.. _message-flashing-pattern:

消息闪现
================

好的应用和用户界面的重点是回馈。如果用户没有得到足够的反馈，他们可能最终
会对您的应用产生不好的评价。Flask 提供了一个非常简单的方法来使用闪现系统
向用户反馈信息。闪现系统使得在一个请求结束的时候记录一个信息，然后在且仅仅在
下一个请求中访问这个数据。这通常配合一个布局模板实现。

简单的闪现
---------------

这里是一个完成的例子::

    from flask import Flask, flash, redirect, render_template, \
         request, url_for

    app = Flask(__name__)
    app.secret_key = 'some_secret'

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        error = None
        if request.method == 'POST':
            if request.form['username'] != 'admin' or \
                    request.form['password'] != 'secret':
                error = 'Invalid credentials'
            else:
                flash('You were successfully logged in')
                return redirect(url_for('index'))
        return render_template('login.html', error=error)

    if __name__ == "__main__":
        app.run()


这里的 ``layout.html`` 模板完成了所有的魔术:

.. sourcecode:: html+jinja

   <!doctype html>
   <title>My Application</title>
   {% with messages = get_flashed_messages() %}
     {% if messages %}
       <ul class=flashes>
       {% for message in messages %}
         <li>{{ message }}</li>
       {% endfor %}
       </ul>
     {% endif %}
   {% endwith %}
   {% block body %}{% endblock %}

这里是 `index.html` 模板:

.. sourcecode:: html+jinja

   {% extends "layout.html" %}
   {% block body %}
     <h1>Overview</h1>
     <p>Do you want to <a href="{{ url_for('login') }}">log in?</a>
   {% endblock %}

这里是登陆模板:

.. sourcecode:: html+jinja

   {% extends "layout.html" %}
   {% block body %}
     <h1>Login</h1>
     {% if error %}
       <p class=error><strong>Error:</strong> {{ error }}
     {% endif %}
     <form action="" method=post>
       <dl>
         <dt>Username:
         <dd><input type=text name=username value="{{
             request.form.username }}">
         <dt>Password:
         <dd><input type=password name=password>
       </dl>
       <p><input type=submit value=Login>
     </form>
   {% endblock %}

分类闪现
------------------------

.. versionadded:: 0.3

当闪现一个消息时，是可以提供一个分类的。未指定分类时默认的分类为 ``'message'`` 。
可以使用分类来提供给用户更好的反馈，例如，错误信息应该被显示为红色北京。

要使用一个自定义的分类，只要使用 :func:`~flask.flash` 函数的第二个参数::

    flash(u'Invalid password provided', 'error')

在模板中，您接下来可以调用 :func:`~flask.get_flashed_messages` 函数来返回
这个分类，在下面的情景中，循环看起来将会有一点点不一样:

.. sourcecode:: html+jinja

   {% with messages = get_flashed_messages(with_categories=true) %}
     {% if messages %}
       <ul class=flashes>
       {% for category, message in messages %}
         <li class="{{ category }}">{{ message }}</li>
       {% endfor %}
       </ul>
     {% endif %}
   {% endwith %}

这仅仅是一个渲染闪现信息的例子，您可也可以使用分类来加入一个诸如
``<strong>Error:</strong>`` 的前缀给信息。

过滤闪现消息
------------------------

.. versionadded:: 0.9

可选地，您可以将一个分类的列表传入到 :func:`~flask.get_flashed_messages` 中，
以过滤函数返回的结果。如果您希望将每个分类渲染到独立的块中，这会非常有用。

.. sourcecode:: html+jinja

    {% with errors = get_flashed_messages(category_filter=["error"]) %}
    {% if errors %}
    <div class="alert-message block-message error">
      <a class="close" href="#">×</a>
      <ul>
        {%- for msg in errors %}
        <li>{{ msg }}</li>
        {% endfor -%}
      </ul>
    </div>
    {% endif %}
    {% endwith %}
