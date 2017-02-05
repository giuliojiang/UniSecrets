all: client install
	cd server && make

client:
	cd script && python preprocess_js.py

install:
	cd script && python initialize_config.py
