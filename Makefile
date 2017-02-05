all: client
	cd server && make

client:
	cd script && python preprocess_js.py

install:
	- mkdir /opt/UniSecrets
	- cp -r config /opt/UniSecrets/config