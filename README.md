# Google Music and iTunes Library rating synchronization Tool

"gmusic-itunes-sync" is an command line tool to synchronize your iTunes Library songs rating (the 'stars') with the "Thumb Up" system of your Google Music Library.

  - Rate your songs on iTunes with at least one star ''
  - Run the tool
  - Automaticly, the same songs on your Google Music Library are going to be "Liked" (thumb up on the UI).

# Demo

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

Mainly tested on my personnal libray with 12K+ songs. Working correctly. 

# Tech

### Synchronization Process


### Tech

gmusic-itunes-sync is written in TypeScript (for learning purpose).

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

Install the dependencies start the tool with the command line.

```sh
$ cd gmusic-itunes-sync
$ npm install -d
$ node app
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
