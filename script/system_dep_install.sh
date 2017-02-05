#! /bin/bash

apt-get update

# Install nodejs
apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install LAMP
apt-get -y install tasksel
tasksel install lamp-server

# Install build-essential
apt-get -y install build-essential