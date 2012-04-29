安全注意事项
=======================

Web 应用通常面临所有种类的安全问题，并且很难把所有事做的正确。 Flask 视图
为你解决这些事情中的一些，但你仍需要关心更多的问题。

.. _xss:

跨站脚本攻击（XSS）
--------------------------

跨站脚本攻击的概念是在一个网站的上下文中注入任意的 HTML （以及附带的
JavaScript ）。开发者需要妥善地转义文本，使其不包含任意 HTML 标签来避免
这种攻击。更多的信息请阅读维基百科上关于 `Cross-Site Scripting
<http://en.wikipedia.org/wiki/Cross-site_scripting>`_ 的文章。

Flask 配置 Jinja2 自动转义所有值，除非显式地指明不转义。这就排除了模板导
致的所有 XSS 问题，但是你仍需要在其它的地方小心:

-   生成 HTML 而不使用 Jinja2
-   在用户提交的数据上调用了 :class:`~flask.Markup`
-   发送上传的 HTML 文件，永远不要这么做，使用
    `Content-Disposition: attachment` 标头来避免这个问题
-   发送上传的文本文件。一些浏览器使用基于开头几个字节的 content-type
    猜测，所以用户可能欺骗浏览器执行 HTML

另一件非常重要的事情是未用引号包裹的属性。虽然 Jinja2 可以通过转义 HTML
来保护你免受 XSS 问题，仍有一种情况，它不能保护你: 属性注入的 XSS 。为了
应对这种攻击媒介，确保当在属性中使用 Jinja 表达式时，始终用单引号或双引号
包裹属性:

.. sourcecode:: html+jinja

   <a href="{{ href }}">the text</a>

为什么这是必要的？因为如果你不这么做，攻击者可以容易地注入自制的
JavaScript 处理器。譬如一个攻击者可以注入这段 HTML+JavaScript:

.. sourcecode:: html

   onmouseover=alert(document.cookie)

当用户鼠标经过这个链接， 会在警告窗口里把 cookie 显示给用户。一个有效的
攻击者可能也会执行其它的 JavaScript 代码，而不是把 cookie 显示给用户。
同 CSS 注入联系在一起，攻击者甚至使得元素填满整个页面，这样用户鼠标在页面
上的任何地方都会触发攻击。

跨站请求伪造（CSRF）
---------------------------------

另一个大问题是 CSRF 。这是一个非常复杂的话题，我不会在此详细介绍，而只会
提及 CSRF 是什么和理论上如何避免它。

如果你的验证信息存储在 cookie 中，你有显式的状态管理。“已登入”状态由一个
cookie 控制，并且这个 cookie 在每个页面的请求中都会发送。不幸的是，在第三
方站点触发的请求中也会发送这个 cookie 。如果你不注意这点，一些人可能会通过
社会工程学来诱导你应用的用户在他们不知道的情况下做一些蠢事。

比如你有一个指定的 URL ，当你发送 `POST` 请求时会删除一个用户的资料（比如
`http://example.com/user/delete` 。如果一个攻击者现在创造一个页面来用
JavaScript 发送这个 post 请求，他们只是诱骗一些用户加载那个页面，而他们
的资料最终会被删除。

想象你在运行 Facebook ，有数以百万计的并发用户，并且某人放出一些小猫图片
的链接。当用户访问那个页面欣赏毛茸茸的猫的图片时，他们的资料就被删除。

你怎样才能阻止这呢？基本上，对于每个修改服务器上内容的请求，你应该使用
一次性令牌，并存储在 cookie 里， **并且** 在发送表单数据的同时附上它。
在服务器再次接收数据之后，你要比较两个令牌，并确保它们相等。

为什么 Flask 没有为你这么做？理想情况下，这应该是表单验证框架做的事，而
Flask 中并不存在表单验证。

.. _json-security:

JSON 安全
-------------

.. admonition:: ECMAScript 5 的变更

   从 ECMAScript 5 开始，常量的行为变化了。现在它们不由 ``Array`` 或其它
   的构造函数构造，而是由 ``Array`` 的内建构造函数构造，关闭了这个特殊的
   攻击媒介。

JSON 本身是一种高级序列化格式，所以它几乎没有什么可以导致安全问题，对吗？
你不能声明导致问题的递归结构，唯一可能导致破坏的就是在接受者角度上，非常
大的响应可以导致某种意义上的拒绝服务攻击。

然而有一个陷阱。由于浏览器在 CSRF 问题上工作的方式， JSON 也不能幸免。幸运
的是， JavaScript 规范中有一个怪异的部分可以用于简易地解决这一问题。 Flask
通过避免你做危险的事情上为你解决了一些。不幸的是，只有在
:func:`~flask.jsonify` 中有这样的保护，所以如果你用其它方法生成 JSON 仍然
有风险。

那么，问题是什么，并且怎样避免？问题是 JSON 中数组是一等公民。想象你在
一个 JSON 请求中发送下面的数据。比如 JavaScript 实现的用户界面的一部分，
导出你所有朋友的名字和邮件地址。并不罕见:

.. sourcecode:: javascript

    [
        {"username": "admin",
         "email": "admin@localhost"}
    ]

这当然只在你登入的时候，且只为你这么做。而且，它对一个特定 URL 上的所有
`GET` 请求都这么做。比如请求的 URL 是
``http://example.com/api/get_friends.json`` 

那么如果一个聪明的黑客把这个嵌入到他自己的网站上，并用社会工程学使得受害
者访问他的网站，会发生什么:

.. sourcecode:: html

    <script type=text/javascript>
    var captured = [];
    var oldArray = Array;
    function Array() {
      var obj = this, id = 0, capture = function(value) {
        obj.__defineSetter__(id++, capture);
        if (value)
          captured.push(value);
      };
      capture();
    }
    </script>
    <script type=text/javascript
      src=http://example.com/api/get_friends.json></script>
    <script type=text/javascript>
    Array = oldArray;
    // now we have all the data in the captured array.
    </script>

如果你懂得一些 JavaScript 的内部工作机制，你会知道给构造函数打补丁和为
setter 注册回调是可能的。一个攻击者可以利用这点（像上面一样上）来获取
所有你导出的 JSON 文件中的数据。如果在 script 标签中定义了内容类型是
``text/javascript`` ，浏览器会完全忽略 ``application/json`` 的
mimetype ，而把其作为 JavaScript 来求值。因为顶层数组元素是允许的（虽然
没用）且我们在自己的构造函数中挂钩，在这个页面载入后， JSON 响应中的数据
会出现在 `captured` 数组中。


因为在 JavaScript 中对象字面量（ ``{...}`` ）处于顶层是一个语法错误，攻
击者可能不只是用 script 标签加载数据并请求一个外部的 URL 。所以， Flask
所做的只是在使用 :func:`~flask.jsonify` 时允许对象作为顶层元素。确保使用
普通的 JSON 生成函数时也这么做。
