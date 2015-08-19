Requirements:
-------------
- nodejs - [http://nodejs.org/](http://nodejs.org/)
- bower (install it running: **npm install -g bower**) - [http://twitter.github.com/bower/](http://twitter.github.com/bower/)
- phantomjs is necessary to run the tests in headless mode - [http://phantomjs.org/](http://phantomjs.org/)
- _(optional)_ simple-http-server (**npm install -g simple-http-server**) can be used to serve the app for debugging or running tests.
  - _usage:_ 
     - cd to project folder
     - **nserver [-d .] [-p 8000]**
     - [http://localhost:8000/test/index.html](http://localhost:8000/test/index.html) - executes the tests

New lib project steps:
----------------------
By default, the template will install ```npm``` and ```bower``` modules, and compile the initial *.less files. If for any reason it fails, you can initialize your project running: 

in a terminal window,

1. **cd _PROJECT_**
2. **npm install**
3. **bower install**
4. **grunt dist --force**

Execute steps 2 and 3 if you have to update the dependencies.

By template DOESN'T setup a 'namespace' for this project at all. You must manually move the main.js file into a folder named with the namespace. All other javascript files (except config.js) must be placed inside this folder. 

Cloned project steps:
---------------------
When you have cloned a project from the git repository, you must update the npm modules as these are not committed to the repo.

1. **cd into the project**
2. **npm install**

Development workflow:
---------------------
When you're developing with ```grunt``` the recommended steps are:

in a terminal window,

1. **cd _PROJECT_**
2. **grunt watch**

It will run compilation (less) and test tasks every time you modify a file.

How to add libraries to the project:
------------------------------------
- Search for the library using: **bower search &lt;library name&gt;**.
- If the library exists in bower registry, then add it to _PROJECT_/components.json and then run **bower install**
- If the library is available in github run **bower install &lt;git repo&gt; --save**
- If _bower_ can't be used to maintain an up to date copy of the library, download the library and put it wherever you want (_maybe under a 'libs' folder?_)

Troubleshooting:
----------------

**After ```grunt init:spr-sim-lib``` nothing seems to be working**

This may happen if ```npm``` or ```bower``` is not installed properly. Ensure that you can run ```npm install``` and ```bower install``` from a command prompt.

**My tests don't work. Can't find a javascript library.**

Ensure that you have the last version of bower: ```npm update -g bower``` and then run ```bower install```.
