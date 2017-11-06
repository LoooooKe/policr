# Policr
A continuous compliance tool based on [Terraform](http://terraform.io)

[![Build Status](https://travis-ci.org/LoooooKe/cloudtool.svg?branch=develop)](https://travis-ci.org/LoooooKe/cloudtool)
[![codecov](https://codecov.io/gh/LoooooKe/cloudtool/branch/develop/graph/badge.svg)](https://codecov.io/gh/LoooooKe/cloudtool)

## Basic concept
![Policr workflow](/doc/images/ccc-workflow.png)

## Build
    git checkout -b develop origin/develop

    grunt build

## Usage
### Plan (Unit tests)
To check terraform scripts locally without deploying it to the provider, use the *plan* mode. 
Therefore one has to write js tests using mocha testing and chai assertions.

See examples in the test branch: [ Tests ](https://github.com/LoooooKe/cloudtool/tree/develop/examples/)

### State (Integration tests)
To check an actual deployment on the provider using the terraform state, one can use the *state* mode.
Tests are also based on mocha testing and chai assertions and are fully compatible with the unit tests from plan mode.

To check terraform scripts locally without deploying it to the provider, user the plan mode. 
Therefore one has to write js tests using mocha testing and chai assertions.

See examples in the test branch: [ Tests ](https://github.com/LoooooKe/cloudtool/tree/develop/examples/)

### Apply
Executes a terraform plan including tests and afterwards the terraform apply command.

### Destory
Executes a terrafrom destroy -f command.

### CLI
    Usage:
       policr.js [OPTIONS] <command> [ARGS]
     
     Options:
       -t, --tests STRING     tests
       -w, --workdir [STRING] workdir (Default is .)
       -s, --skipTests TRUE   skipTests
       -h, --help             Display help and usage details
     
     Commands:
       apply, destroy, force-unlock, init, plan, state
       
## Contributing
Contributions to the code, examples, documentation, etc, are very much appreciated. For more information, see the contribution guidelines.

Report issues and bugs directly in this GitHub project.

## Credits
This is a collaboration between the [Scigility](http://www.scigility.com) and [Developers of Swiss Postal IT](http://www.swisspush.org/).

## License
The project is licensed under the Apache License, version 2.0.

