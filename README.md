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

## Configuration files

Configuration files will be created under `UniSecrets/config`

### server_config.json

This file specifies server-side settings.

* `admin_emails` an array containing email addresses that will be used to send notifications to system admins

* `auto_enable_colleges` if set to `true`, college domains will be enabled without admin approval

* `email_hostname` the email domain name used to send emails from the server

* `hostname` hostname of the server, used by clients to connect via http and ws

* `http_port` and `https_port` ports where to listen

* `mail_debug_mode` when set to `true` no emails will be sent, but only printed to console

* `mail_dkim_privkey`, `mail_dkim_selector`, `mail_use_dkim` to enable and configure dkim signatures

* `ssl_certificate`, `ssl_privkey` paths to ssl fullchain certificate and private key files if SSL is to be enabled

* `use_ssl` enables SSL

* `ws_port` port for websocket service to listen

### limiter.json

The limiter module specifies limits for all users, such as the number of posts, registration attempts per unit of time. The configuration file can be edited to change the limits if necessary.

Each limit has 4 parameters:

* `locality`, can be `ip` (limit applies for the ip used to connect) or `user` (limit applies for the user)

* `timeframe` can be `tick` (1 minute unit) or `tock` (1 hour unit) after which limits are reset

* `sensitivity` can be `count` (counter is increased for each action taken) or `error` (counter is increased only when the action fails, such as login failure)

* `limit` the number of attempts before any more actions of the same category are automatically blocked

## First time setup

First time setup is very simple:

* Start the server `./StartServer`

* Direct your browser to `localhost:8080` (or the corresponding address if you have changed hostname/port/ssl in the configuration files

You will be redirected automatically to a setup page where you can create an administrator account.

Once completed the setup, your admin account can be used to activate new college emails and approve posts.

## Starting the server

Simply run `./StartServer`

## About hacks

This project was created by Giulio Jiang and Abraao Mota during the Hackathon ICHack 17.

Warning! This project contains hacks! They are totally hacky in the sense that they are no common practice at all, but that doesn't mean it makes the project less mantainable or understandable (they probably make it better ;) ). Enjoy!
