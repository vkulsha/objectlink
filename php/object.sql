#DROP TABLE IF EXISTS object;
CREATE TABLE object (
  id int(20) NOT NULL AUTO_INCREMENT,
  n varchar(1024) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY indn (n)
);