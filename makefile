.PHONY: default build test

start:
	@ ./node_modules/.bin/babel-node src/rdcli.js $(filter-out $@,$(MAKECMDGOALS))

test:
	@ cp -n config/test.json.dist config/test.json
	@ NODE_ENV=test ./node_modules/.bin/mocha -t 0 --compilers js:babel-core/register --require babel-polyfill test/setup.js test/*.spec.js

build:
	@ mkdir -p build
	@ ./node_modules/.bin/babel src/ --out-dir build/ --compact true
	@ chmod +x build/rdcli.js
