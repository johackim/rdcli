.PHONY: build test

install: ## Install dependencies
	npm install

build: ## Build with babel
	@ mkdir -p build
	@ ./node_modules/.bin/babel src/ --out-dir build/ --compact true
	@ chmod +x build/rdcli.js

run: ## Run with babel
	@ ./node_modules/.bin/babel-node src/rdcli.js $(filter-out $@,$(MAKECMDGOALS))

debug: ## Run with babel (with debug)
	@ DEBUG=torrent,download,connect,unrestrict ./node_modules/.bin/babel-node src/rdcli.js $(filter-out $@,$(MAKECMDGOALS))

test: ## Run unit tests
	@ cp -n config/test.json.dist config/test.json
	@ NODE_ENV=test ./node_modules/.bin/mocha --compilers js:babel-core/register --require babel-polyfill test/setup.js test/spec/*.spec.js

deploy: ## Deploy
	npm publish

lint:
	@ ./node_modules/.bin/eslint src/

lint-fix:
	@ ./node_modules/.bin/eslint --fix src/
