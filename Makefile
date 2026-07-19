.PHONY: run dev build start lint install clean fresh

run: dev

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

install:
	npm install

clean:
	rm -rf .next

fresh: clean
	rm -rf node_modules
	npm install
