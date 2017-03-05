all: install client
	cd server && make

client: install
	cd script && python preprocess_js.py

install:
	cd script && python initialize_config.py

purge: clean
	- rm -rf config
	- rm -rf db
	- rm -rf tmp

clean:
	- rm -rf tmp
	cd server && make clean

installdb:
	cd db && ./createTables.sh
