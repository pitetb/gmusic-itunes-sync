# Google Music and iTunes Library rating synchronization Tool

"gmusic-itunes-sync" is an command line tool to synchronize your iTunes Library songs rating (the 'stars') with the "Thumb Up" system of your Google Music Library.

  - Rate your songs on iTunes with at least one star '☆'
  - Run the tool
  - Automaticly, the same songs on your Google Music Library are going to be "Liked 👍" (thumb up on the UI). 

# Demo

<img src="https://github.com/pitetb/gmusic-itunes-sync/raw/master/gmuic-itunes-sync.gif" alt="Drawing" style="width: 600px;"/>

Mainly tested on my personnal libray with 12K+ songs. 

# Tech

### Synchronization Process

The synchronization is ONE WAY ONLY. The iTunes ranking is copied to the Google Music library (not in the other way)

Matching is done based on title, artiste and track number on the disc. YOU SHOULD HAVE YOUR MP3 CORRECTLY TAGGED to make it work.

### Tech

gmusic-itunes-sync is written fully in TypeScript (for learning/testing purpose).

It also uses a number of open source projects to work properly:

* [playmusic] - Google Play music client (unofficial).
* [itunes-music-library-path] - iTunes Music Library Path library.
* [xmldom] - A xml dom parser
* [xpath] - A xpath query parser
* [lokijs] - LokiJS - In memory db.
* [commander] - Command line parser.
* [inquirer] - Command line utility.
* [strongly-typed-event] - typescript event based system 


### Installation

gmusic-itunes-sync requires [Node.js](https://nodejs.org/) v6+ to run.

It's a classical npm package with an executable command: 'gmusic-itunes-sync'.
This command will be installed on the '.bin' directory of npm when the npm package is intalled.

Install the dependencies start the tool with the command line.

```sh
$ mkdir gmusic-itunes-sync
$ npm init
$ npm install gmusic-itunes-sync --save
$ ./node_modules/.bin/gmusic-itunes-sync 
$ ? The user on Google Music Library service (email) :
$ // Here follow the instructions
```

### Development

Want to contribute? Great! Thanks in advance! :)

### Todos

 - Write unit tests and automate build
 - Do more test with different environement
 - Test with more library and users

License
----

MIT

**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [gmusic-itunes-sync]: <https://github.com/pitetb/gmusic-itunes-sync>
   [itunes-music-library-path]: <https://github.com/johnpaulvaughan/itunes-music-library-path>
   [lokijs]: <http://lokijs.org/#/>
   [commander]: <https://github.com/tj/commander.js/>
   [inquirer]: <https://github.com/SBoudrias/Inquirer.js>
   [playmusic]: <https://github.com/jamon/playmusic>
   [strongly-typed-event]: <https://github.com/KeesCBakker/Strongly-Typed-Events-for-TypeScript>
   [xmldom]: <https://github.com/jindw/xmldom/>
   [xpath]: <https://github.com/goto100/xpath>
