CREATE USER 'UniSecrets'@'localhost' IDENTIFIED BY 'UniSecrets';
GRANT ALL PRIVILEGES ON UniSecrets . * TO 'UniSecrets'@'localhost';
FLUSH PRIVILEGES;