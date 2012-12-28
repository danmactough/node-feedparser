MOCHA = ./node_modules/mocha/bin/mocha

test:
	@$(MOCHA) --timeout 5s --reporter spec

.PHONY: test
