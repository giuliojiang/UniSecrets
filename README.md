# Uni Secrets

A website where to share university secret stories.

Accessible only by students and academic people!

## Requirements

* NodeJS v7
* MySQL database on `localhost` setup with username database password all to `UniSecrets`
* `sendmail` setup on localhost

## Building

Run `make` to install all npm modules.

If it is the first time you setup the server, you'll need:

* run `make install` to initialize configuration files for your system. You can then edit `/opt/UniSecrets/config/` configuration files.

* a pem private key in `/opt/UniSecrets/mail.private`

## Starting the server

Simply run `./StartServer`
