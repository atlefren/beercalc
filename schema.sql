drop table if exists malts;
create table malts (
  id integer primary key autoincrement,
  name string not null,
  max_ppg int,
  color int
);

CREATE TABLE brews (id integer primary key autoincrement, data text);