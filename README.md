Margarita
=========
[![Build Status](https://travis-ci.org/CourseAdvisor/margarita.svg?branch=master)](https://travis-ci.org/CourseAdvisor/margarita)

A lightweight tequila development and testing service.

## Overview

Margarita is a nodejs application which allows you to mock EPFL's tequila authentication service for
testing or development purposes.
Create fake user profiles and use these to log into your application.

## Usage

Download and install depedencies:
```
git clone https://github.com/CourseAdvisor/margarita.git
cd margarita
npm install
```

Set up some profiles:
```
cp profiles_example.json profiles.json
```

Start the server:
```
node bin/www
```

Then navigate to [http://localhost:3000/](http://localhost:3000/)

## Documentation

Detailed instructions on how to develop with tequila/margarita can be found in the [manual](MANUAL.md).

## Contributing

Right now, this app fits the basic requirements to mock tequila for [CourseAdvisor](/CourseAdvisor/courseadvisor) and
some features and definitions might be missing. Feel free to file an issue or send pull requests :) Be sure to check your code with `npm test` though (requires `npm install -g jshint`).
