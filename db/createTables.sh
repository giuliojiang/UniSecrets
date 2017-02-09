#! /bin/bash
mysql -u root -p < UniSecrets.sql
mysql -u root -p < CreateUser.sql
