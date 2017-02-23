# Uni Secrets

A website where to share university secret stories.

Accessible only by students and academic people!

## Requirements

* NodeJS v7
* `sendmail` setup on localhost
* `python`
* `cpp` (The C preprocessor)
* `make`

## Building

Developed and tested on Ubuntu 16.04. It also works on OSX.
Other UNIX based systems should be supported with possibly minor changes.

Run `make` to install all npm modules.

If it is the first time you setup the server, configuration files will be created for you. You can edit files in `config` directory to change some settings.

`make clean` can be used to remove all temporaries

`make purge` will also clean all configuration

## Bootstrapping and database configuration

Initially, the database will be empty. UniSecrets uses `nedb` which doesn't require any external dependency.

Initially there will be no users or approved email domains.

At the beginning, you can set in `config/server_config.json` the flag `auto_enable_emails` to `true` so that new email domains don't need to be approved by an admin (there are no admins in the system yet).

Now you can start the server and register a new user.

To make a user into admin, stop the server, and run the script `tools_makeadmin.js`:
```
cd UniSecrets/server
node tools_makeadmin.js
```
and type in the email addresses of the users that should be admins.

Warning: these manual database scripts do not sanitize user input because they are meant to be used by server administrators only.

## Starting the server

Simply run `./StartServer`

## About hacks

This project was created by Giulio Jiang and Abraao Mota during the Hackathon ICHack 17.

Warning! This project contains hacks! They are totally hacky in the sense that they are no common practice at all, but that doesn't mean it makes the project less mantainable or understandable (they probably make it better ;) ). Enjoy!

## Live website

https://www.unisecrets.co.uk
