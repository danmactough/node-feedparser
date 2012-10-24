MOCHA = ./node_modules/mocha/bin/mocha

test:
	@$(MOCHA) --reporter spec

.PHONY: test
