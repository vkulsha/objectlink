#DROP TABLE IF EXISTS link;
CREATE TABLE link (
  id int(20) NOT NULL AUTO_INCREMENT,
  o1 int(20) DEFAULT NULL,
  o2 int(20) DEFAULT NULL,
  c int(20) DEFAULT '1',
  d timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  u int(20) DEFAULT '1',
  PRIMARY KEY (id),
  KEY indo1 (o1),
  KEY indo2 (o2),
  KEY indc (c),
  KEY indd (d),
  KEY indu (u)
);