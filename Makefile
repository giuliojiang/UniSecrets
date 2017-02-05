all: client
	cd server && make

client:
	cd script && python preprocess_js.py
