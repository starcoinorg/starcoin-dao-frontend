build:
	mpm package build

test:
	mpm package test && mpm integration-test

fix-test:
	mpm integration-test --ub

release:
	mpm release

clean:
	rm -rf build/ && rm -rf release/
