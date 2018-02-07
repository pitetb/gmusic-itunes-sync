#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const inquirer = require("inquirer");
const UserSettings_1 = require("./UserSettings");
const Main_1 = require("./Main");
program
    .version('1.0.0', '-v, --version')
    .description('Google Music and iTunes library songs rating synchronisation tool')
    .option('-xml, --itunesXml [itunesXml]', 'The path to XML iTunes Music library file. If not provided, the system will try to find it automaticly')
    .option('-u, --username <username>', 'The user to authenticate as on Google Music Library service')
    .option('-p, --password <password>', 'The user\'s password on Google Music Library service');
program.parse(process.argv);
var questions = [
    {
        type: 'input',
        name: 'username',
        message: "The user on Google Music Library service (email)"
    },
    {
        type: 'password',
        message: 'The user\'s password on Google Music Library service',
        name: 'password',
        mask: '*'
    }
];
// Treating received parameters
if (program.password) {
    questions.splice(1, 1);
}
if (program.username) {
    questions.splice(0, 1);
}
// Launching main program with user settings
inquirer.prompt(questions).then(answers => {
    // Retrieving answers
    program.username = program.username ? program.username : answers.username;
    program.password = program.password ? program.password : answers.password;
    // Preparing userSettings object to launch program
    let userSettings = new UserSettings_1.UserSettings();
    userSettings.gLogin = program.username;
    userSettings.gPasswd = program.password;
    userSettings.itLibraryPath = program.itunesXml;
    //console.log(userSettings.gLogin);
    //console.log(userSettings.gPasswd);
    // Launch program
    Main_1.Main.main(userSettings);
});
//# sourceMappingURL=Cli.js.map