.. _caching-pattern:

缓存
=======

如果您的应用运行很慢，那就尝试引入一些缓存吧。好吧，至少这是提高表现
最简单的方法。缓存的工作是什么呢？比如说您有一个需要一段时间才能完成
的函数，但是这个函数的返回结果可能在5分钟之内都是足够有效的，因此您可以
将这个结果放到缓存中一段时间，而不用反复计算。

Flask 本身并不提供缓存功能，但是作为Flask 基础的 Werkzeug 库，则提供了一些
基础的缓存支持。Werkzeug 支持多种缓存后端，通常的选择是 Memcached 服务器。

配置缓存
------------------

类似于建立 :class:`~flask.Flask` 的对象一样，您创建一个缓存对象，然后让他
保持存在。如果您使用的是开发服务器，您可以创建一个 :class:`~werkzeug.contrib.cache.SimpleCache` 
对象，这个对象将元素缓存在 Python 解释器的控制的内存中::

    from werkzeug.contrib.cache import SimpleCache
    cache = SimpleCache()

如果您希望使用 Memcached 进行缓存，请确保您已经安装了 Memcache 模块支持
(您可以通过 `PyPi<http://pypi.python.org/` 获取)，并且有一个可用的 Memcached
服务器正在运行。然后您可以像下面这样连接到缓存服务器::

    from werkzeug.contrib.cache import MemcachedCache
    cache = MemcachedCache(['127.0.0.1:11211'])

如果您在使用 App Engine ，您可以轻易地通过下面的代码连接到 App Engine 的
缓存服务器::

    from werkzeug.contrib.cache import GAEMemcachedCache
    cache = GAEMemcachedCache()

使用缓存
-------------

有两个非常重要的函数可以用来使用缓存。那就是 :meth:`~werkzeug.contrib.cache.BaseCache.get` 
函数和 :meth:`~werkzeug.contrib.cache.BaseCache.set` 函数。他们的使用方法
如下:

从缓存中读取项目，请使用 :meth:`~werkzeug.contrib.cache.BaseCache.get` 函数，
如果现在缓存中存在对应项目，它将会返回。否则函数将会返回 `None` ::

    rv = cache.get('my-item')

在缓存中添加项目，使用 :meth:`~Werkzeug.contrib.cache.BaseCache.set` 函数。
第一个参数是想要设定的键，第二个参数是想要缓存的值。您可以设定一个超时时间，
当时间超过时，缓存系统将会自动清除这个项目。

以下是一个通常情况下实现功能完整例子::

    def get_my_item():
        rv = cache.get('my-item')
        if rv is None:
            rv = calculate_value()
            cache.set('my-item', rv, timeout=5 * 60)
        return rv
