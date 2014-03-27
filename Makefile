mostdoc.js: bootstrap.js index.html
	@node bootstrap.js index.html
	@mv mostdoc.js mostdoc0.js
	@node mostdoc0.js index.html
	@rm mostdoc0.js
	@[ -f mostdoc.js ] || (echo "mostdoc.js was not generated"; exit 1)
