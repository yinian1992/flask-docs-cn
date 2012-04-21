.. _tutorial-schema:

步骤 1: 数据库模式
=======================

首先我们要创建数据库模式。对于这个应用只有一张表就足够了，并且我们只需要支持 SQLite ，所以很简单。只需要把下面的内容放进一个名为 `schema.sql` 的文件，放在刚才创建的 `flaskr` 文件夹中:

.. sourcecode:: sql

    drop table if exists entries;
    create table entries (
      id integer primary key autoincrement,
      title string not null,
      text string not null
    );

这个模式由一个名为 `entries` 的表组成，表中每列包含一个 `id` 、 一个 `title` 和 一个 `text` 。 `id` 是一个自增的整数，也是主键；其余的两个是字符串，且为非空。


继续 :ref:`tutorial-setup`.
