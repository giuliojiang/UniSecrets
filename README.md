# Uni Secrets

A website where to share university secret stories.

Accessible only by students and academic people!

## Requirements

* NodeJS v7
* MySQL database on `localhost` setup with username database password all to `UniSecrets`
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

## Starting the server

Simply run `./StartServer`

## About hacks

This project was created by Giulio Jiang and Abraao Mota during the Hackathon ICHack 17.

Warning! This project contains hacks! They are totally hacky in the sense that they are no common practice at all, but that doesn't mean it makes the project less mantainable or understandable (they probably make it better ;) ). Enjoy!

## Live website

(coming soon)
