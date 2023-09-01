lint: 
	npx eslint .
build:
	npx webpack
install:
	npm i
buildDev:
	npx webpack --mode=development 