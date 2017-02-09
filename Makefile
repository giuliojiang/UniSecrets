all: install client
	cd server && make

client:
	cd script && python preprocess_js.py

install:
	cd script && python initialize_config.py

purge: clean
	- rm -rf config

clean:
	- rm -rf tmp
	cd server && make clean

installdb:
	cd db && ./createTables.sh
