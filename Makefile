.PHONY: run dev build start lint install clean fresh verify-deploy

run: dev

dev:
	npm run dev

build:
	npm run build

# Build as Vercel does: tracked files only, clean install, no workspace symlink.
# Local `make build` can pass on things this catches — run before pushing.
verify-deploy:
	./scripts/verify-deploy.sh

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
