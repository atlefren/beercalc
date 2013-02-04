drop table if exists malts;
create table malts (
  id integer primary key autoincrement,
  name string not null,
  max_ppg int,
  color int
);

INSERT INTO malts (name, max_ppg, color) VALUES ('Marris Otter', 38.0. 8.0);