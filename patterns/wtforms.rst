使用 WTForms 进行表单验证
============================

如果您不得不跟浏览器提交的表单数据打交道，视图函数里的代码将会很快变得
难以阅读。有不少的代码库被开发用来简化这个过程的操作。其中一个就是 `WTForms`_ ，
这也是我们今天主要讨论的。如果您发现您自己陷入处理很多表单的境地，那您也许
应该尝试一下他。

要使用 WTForms ，您需要先将您的表单定义为类。我建议您将应用分割为多个模块
(:ref:`larger-applications`) ，这样的话您仅需为表单添加一个独立的模块。

.. admonition:: 挖掘 WTForms 的最大潜力

   `Flask-WTF`_ 扩展在这个模式的基础上扩展并添加了一些随手即得的精巧
   的帮助函数，这些函数将会使在 Flask 里使用表单更加有趣，您可以通过
   `PyPI <http://pypi.python.org/pypi/Flask-WTF>`_ 获取它。

.. _Flask-WTF: http://packages.python.org/Flask-WTF/

表单
---------

以下是一个典型的注册页面的例子::

    from wtforms import Form, BooleanField, TextField, PasswordField, validators

    class RegistrationForm(Form):
        username = TextField('Username', [validators.Length(min=4, max=25)])
        email = TextField('Email Address', [validators.Length(min=6, max=35)])
        password = PasswordField('New Password', [
            validators.Required(),
            validators.EqualTo('confirm', message='Passwords must match')
        ])
        confirm = PasswordField('Repeat Password')
        accept_tos = BooleanField('I accept the TOS', [validators.Required()])

在视图里
-----------

在视图函数中，表单的使用是像下面这个样子的::

    @app.route('/register', methods=['GET', 'POST'])
    def register():
        form = RegistrationForm(request.form)
        if request.method == 'POST' and form.validate():
            user = User(form.username.data, form.email.data,
                        form.password.data)
            db_session.add(user)
            flash('Thanks for registering')
            return redirect(url_for('login'))
        return render_template('register.html', form=form)

注意到我们视图中使用了 SQLAlchemy (参考 :ref:`sqlalchemy-pattern` )。但是
这并非必要的，请按照您的需要修正代码。

备忘表:

1. 如果数据是以 `POST` 方式提交的，那么基于请求的 :attr:`~flask.request.form` 
   属性的值创建表单。反过来，如果是使用 `GET` 提交的，就从 
   :attr:`~flask.request.args` 属性创建。
2. 验证表单数据，调用 :func:`~wtforms.form.Form.validate` 方法。如果数据验证
   通过，此方法将会返回 `True` ，否则返回 `False` 。
3. 访问表单的单个值，使用 `form.<NAME>.data` 。

在模板中使用表单
------------------

在模板这边，如果您将表单传递给模板，您可以很容易地渲染他们。参看如下代码，
您就会发现这有多么简单了。WTForms 已经为我们完成了一半的表单生成工作。更
棒的是，我们可以编写一个宏来渲染表单的字段，让这个字段包含一个标签，如果
存在验证错误，则列出列表来。

以下是一个使用这种宏的 `_formhelpers.html` 模板的例子:

.. sourcecode:: html+jinja

    {% macro render_field(field) %}
      <dt>{{ field.label }}
      <dd>{{ field(**kwargs)|safe }}
      {% if field.errors %}
        <ul class=errors>
        {% for error in field.errors %}
          <li>{{ error }}</li>
        {% endfor %}
        </ul>
      {% endif %}
      </dd>
    {% endmacro %}

这些宏接受一对键值对，WTForms 的字段函数接收这个宏然后为我们渲染他们。
键值对参数将会被转化为 HTML 属性，所以在这个例子里，您可以调用
``render_field(form.username,class="username")`` 来将一个类添加到这个
输入框元素中。请注意 WTForms 返回标准 Python unicode 字符串，所以我们
使用 `|safe` 告诉 Jinjan2 这些数据已经是经过 HTML 过滤处理的了。

以下是 `register.html` 模板，它对应于上面我们使用过的函数，同时也利用
了 `_formhelpers.html` 模板:

.. sourcecode:: html+jinja

    {% from "_formhelpers.html" import render_field %}
    <form method=post action="/register">
      <dl>
        {{ render_field(form.username) }}
        {{ render_field(form.email) }}
        {{ render_field(form.password) }}
        {{ render_field(form.confirm) }}
        {{ render_field(form.accept_tos) }}
      </dl>
      <p><input type=submit value=Register>
    </form>

关于 WTForms 的更多信息，请访问 `WTForms 网站`_ 。

.. _WTForms: http://wtforms.simplecodes.com/
.. _WTForms 网站: http://wtforms.simplecodes.com/
