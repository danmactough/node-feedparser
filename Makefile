MOCHA = ./node_modules/mocha/bin/mocha

test:
	@$(MOCHA) --reporter list

.PHONY: test
