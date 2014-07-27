.. _tutorial-schema:

步骤 1: 数据库模式
=======================

首先我们要创建数据库模式。对于这个应用来说，一张表就足够了，而
且只需支持 SQLite，所以会很简单。只需要把下面的内容放进一个名为
`schema.sql` 的文件，放在刚才创建的 `flaskr` 文件夹中:

.. sourcecode:: sql

    drop table if exists entries;
    create table entries (
      id integer primary key autoincrement,
      title string not null,
      text string not null
    );

这个模式包含一个名为 `entries` 的表，该表中的每行都包含一个
`id` 、一个 `title` 和 一个 `text` 。 `id` 是一个自增的整数，也
是主键；其余的两个是字符串，且不允许为空。


阅读 :ref:`tutorial-setup` 以继续。
