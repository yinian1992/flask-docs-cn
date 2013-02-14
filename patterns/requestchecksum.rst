请求内容校验码
=========================

许多代码可以消耗请求数据并对其进行预处理。例如最终出现在已读取的请求对
象上的 JSON 数据、通过另外的代码路径出现的表单数据。当你想要校验收到的
请求数据时，这似乎带来不便。而有时这对某些 API 是必要的。

幸运的是，无论如何可以包装输入流来简单地改变这种状况。

下面的例子计算收到数据的 SHA1 校验码，它从 WSGI 环境中读取数据并把校验
码存放到其中::

    import hashlib

    class ChecksumCalcStream(object):

        def __init__(self, stream):
            self._stream = stream
            self._hash = hashlib.sha1()

        def read(self, bytes):
            rv = self._stream.read(bytes)
            self._hash.update(rv)
            return rv

        def readline(self, size_hint):
            rv = self._stream.readline(size_hint)
            self._hash.update(rv)
            return rv

    def generate_checksum(request):
        env = request.environ
        stream = ChecksumCalcStream(env['wsgi.input'])
        env['wsgi.input'] = stream
        return stream._hash

要使用这段代码，所有你需要做的就是在请求消耗数据之前调用计算流。（例如：
小心访问 ``request.form`` 或其它此类的东西。例如，应注意避免
``before_request_handlers`` 访问它）。

用法示例::

    @app.route('/special-api', methods=['POST'])
    def special_api():
        hash = generate_checksum(request)
        # Accessing this parses the input stream
        files = request.files
        # At this point the hash is fully constructed.
        checksum = hash.hexdigest()
        return 'Hash was: %s' % checksum

