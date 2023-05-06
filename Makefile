install:
	npm ci
	npm link
	
publish: 
	npm publish --dry-run

lint: 
	npx eslint .
start:
	npm start