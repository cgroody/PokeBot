// MySQL Connection
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "PokeBot",
  password: "12pokemon34",
  database: "pokebot"
});

// Connect to MySQL
con.connect(function(err) {
  if (err) throw err;
  console.log("MySQL Connected!");
});

// DISCORD
const Discord = require('discord.js'); //import discord.js
const { Client, Collection, Intents } = require('discord.js');
require('dotenv').config(); //initialize dotenv
const { token } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// EXTRA FOLDERS?
const fs = require('node:fs');
const path = require('node:path');
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}


// CLIENT READY
client.once('ready', () => {
	console.log('PokeBot is Ready!');
});
client.login(token);

////////////////////////
// Global Variables  ///
////////////////////////
var maxNumberPkmn = '796';
var strSql = '';
var sqlDefaultErrorMsg = 'Hmmm I need my coffee first!';


////////////////////////
// Message Handling  ///
////////////////////////
client.on('messageCreate', msg => {
    var msgContent = msg.content.toLowerCase();
    console.log(msg.author.username + ': ' + msgContent);

    // IGNORE SELF
    if (msg.author == client.user) {
        console.log('Ignoring Self: ' + client.user);
        return;
    }

    // IGNORE BOTS
    if (msg.author.bot) {
        console.log('Ignoring Bot: ' + msg.author.bot);
        return;
    }

    // IGNORE NON-COMMANDS
    if (msgContent.substring(0, 1) != '$') {
        console.log('Ignoring Non-Command: ' + msgContent);
        return;
    }

    ////////////////////////
    // $RANDOM
    ////////////////////////
    if (msgContent == '$random') {
        console.log('--- $RANDOM --- ');
        // Global Assets
        var pokemonNumber = Math.floor(Math.random() * maxNumberPkmn) + 1;
        strSql = `SELECT jsOutput FROM vewpokemoninfo WHERE PKey = \'` + pokemonNumber + `\'`;

        // RUN SQL
        console.log('- SQL RUN(' + strSql + ')');
        con.query(strSql, (error, results) => {
            if (error) {
                msg.reply(sqlDefaultErrorMsg);
                console.log('######  SQL Error  ######');
                return console.error(error.message);
            }
            console.log(results);

            // Get Amount of Rows Returned
            var sqlRowsReturned = Object.keys(results).length;
            console.log('- Rows Returned(' + sqlRowsReturned + ')');

            // PARSE & SET SUCCESS MESSAGE
            if (sqlRowsReturned > 0) {
                console.log('- Parsing Begin -');
                var sqlResultsReturned = '';
                var sqlResultsReturned = results[0].jsOutput;
                console.log('- Total Parsed: ');
                console.log(sqlResultsReturned);
                console.log('- End Parsing -');
            }
            else {
                strOutput = null;
            }

            console.log('- Sending Output to User - ');
            console.log(sqlResultsReturned);
            msg.reply(sqlResultsReturned);
            console.log('- Sent Output to User - ');
        });
    }


    ////////////////////////
    // $ME OR $HTC
    ////////////////////////
    else if (msgContent == '$me' || msgContent == '$htc') {
        console.log('--- $ME/HTC --- ');

        // Grab User ID
        var authorID = msg.author.id;
        if (authorID == null) {
            console.log('--- ERR --- Null AuthorID(' + authorID + ')');
            msg.reply('I am unable to get your ID right now.');
            return;
        }

        // SQL STATEMENT
        strSql = 'SELECT PKey FROM tbltrainer WHERE AccountID =\'' + authorID + '\'';

        // RUN SQL
        console.log('- SQL RUN(' + strSql + ')');
        con.query(strSql, (error, results) => {
            if (error) {
                msg.reply(sqlDefaultErrorMsg);
                console.log('######  SQL Error  ######');
                return console.error(error.message);
            }
            console.log(results);

            // Get Amount of Rows Returned
            var sqlRowsReturned = Object.keys(results).length;
            console.log('- Rows Returned(' + sqlRowsReturned + ')');

            // NO ROWS, TELL USER TO REGISTER
            if (sqlRowsReturned < 1) {
                console.log('- No Rows - Not Registered');
                msg.reply('You are not registered yet please use $reg to register yourself.');
                return;
            }

            if (msgContent === '$htc') {
                strSql = `SELECT TrainerCode as 'jsOutput' FROM vewtrainerinfo WHERE AccountID = \'` + authorID + `\'`;
            }
            else {
                strSql = `SELECT TrainerInfo as 'jsOutput' FROM vewtrainerinfo WHERE AccountID = \'` + authorID + `\'`;
            }

            // RUN SQL
            console.log('- SQL RUN(' + strSql + ')');
            con.query(strSql, (error, results) => {
                if (error) {
                    msg.reply(sqlDefaultErrorMsg);
                    console.log('######  SQL Error  ######');
                    return console.error(error.message);
                }
                console.log(results);

                // Get Amount of Rows Returned
                var sqlRowsReturned = Object.keys(results).length;
                console.log('- Rows Returned(' + sqlRowsReturned + ')');

                // PARSE & SET SUCCESS MESSAGE
                if (sqlRowsReturned > 0) {
                    console.log('- Parsing Begin -');
                    var sqlResultsReturned = '';
                    var sqlResultsReturned = results[0].jsOutput;
                    console.log('- Total Parsed: ');
                    console.log(sqlResultsReturned);
                    console.log('- End Parsing -');
                }
                else {
                    strOutput = null;
                }

                console.log('- Sending Output to User - ');
                console.log(sqlResultsReturned);
                msg.reply(sqlResultsReturned);
                console.log('- Sent Output to User - ');
            });
        });
        return;
    }


    ////////////////////////
    // $LU OR $LOOKUP
    ////////////////////////
    else if (msgContent.substring(0, 4) == '$lu ' || msgContent.substring(0, 8) == '$lookup ') {
        console.log('--- $LOOKUP --- ');
        // Get User Entry
        if (msgContent.substring(0, 4) == '$lu ') {
            var pokemonEntry = msgContent.substring(4, msgContent.length);
        }
        else if (msgContent.substring(0, 8) == '$lookup ') {
            var pokemonEntry = msgContent.substring(8, msgContent.length);
        }

        // User Entered Number or Name?
        if (isNaN(pokemonEntry)) {
            strSql = `SELECT jsOutput FROM vewpokemoninfo WHERE Name = \'` + pokemonEntry + `\'`;
        } else {
            if (pokemonEntry < 1 || pokemonEntry > maxNumberPkmn) {
                msg.reply('That is not a pokemon number in the pokedex I know.');
                console.log('That is not a pokemon number in the pokedex I know.' + pokemonEntry);
                return;
            }
            strSql = `SELECT jsOutput FROM vewpokemoninfo WHERE Number = \'` + pokemonEntry + `\'`;
        }

        // RUN SQL
        console.log('- SQL RUN(' + strSql + ')');
        con.query(strSql, (error, results) => {
            if (error) {
                msg.reply(sqlDefaultErrorMsg);
                console.log('######  SQL Error  ######');
                return console.error(error.message);
            }
            console.log(results);

            // Get Amount of Rows Returned
            var sqlRowsReturned = Object.keys(results).length;
            console.log('- Rows Returned(' + sqlRowsReturned + ')');

            // PARSE & SET SUCCESS MESSAGE
            if (sqlRowsReturned > 0) {
                console.log('- Parsing Begin -');
                var sqlResultsReturned;
                Object.keys(results).forEach(function (key) {
                    var row = results[key];
                    if (key == 0)
                        sqlResultsReturned = row.jsOutput;
                    else
                        sqlResultsReturned = sqlRowsReturned + '\n' + row.jsOutput;
                    console.log('- Parsing Row(' + key + ') : (' + row.jsOutput + ')');
                });
                console.log('- Total Parsed: ');
                console.log(sqlResultsReturned);
                console.log('- End Parsing -');
            }
            else {
                strOutput = null;
            }

            console.log('- Sending Output to User - ');
            console.log(sqlResultsReturned);
            msg.reply(sqlResultsReturned);
            console.log('- Sent Output to User - ');
        });



    }


    ////////////////////////
    // $REGISTER
    ////////////////////////
    else if (msgContent == '$reg' || msgContent == '$register') {


        console.log('Starting Registration ');
        var authorName = msg.author.username;
        var authorID = msg.author.id;
        if (authorID == null) {
            console.log('--- ERR --- Null AuthorID(' + authorID + ')');
            msg.reply('I am unable to get your ID right now.');
            return;
        }
        console.log('Author ID' + authorID);
        console.log('Author Name' + authorName);

        // SQL
        strSql = 'SELECT TrainerName, TrainerCode, Level, Team, FavoritePokemon FROM vewtrainerinfo WHERE AccountID =\'' + authorID + '\'';

        // RUN SQL
        console.log('- SQL RUN(' + strSql + ')');
        con.query(strSql, (error, results) => {
            if (error) {
                msg.reply(sqlDefaultErrorMsg);
                console.log('######  SQL Error  ######');
                return console.error(error.message);
            }
            console.log(results);

            // Ouput Full Results.
            var sqlRowsReturned = Object.keys(results).length;
            var finishRegMsg = '';

            // No Records Returned.
            if (sqlRowsReturned > 0) {
                finishRegMsg = 'To complete your registration remember to set your information using the commands below:';
                var isNotComplete = 0;
                if (results[0].TrainerName == null || results[0].TrainerName == '') {
                    finishRegMsg = finishRegMsg + '\n' + '$setname <TrainerName>';
                    isNotComplete = 1;
                }
                if (results[0].TrainerCode == null || results[0].TrainerCode == '') {
                    finishRegMsg = finishRegMsg + '\n' + '$setcode <TrainerCode>';
                    isNotComplete = 1;
                }
                if (results[0].Level == null || results[0].Level == '') {
                    finishRegMsg = finishRegMsg + '\n' + '$setlevel <Level>';
                    isNotComplete = 1;
                }
                if (results[0].FavoritePokemon == null || results[0].FavoritePokemon == '') {
                    finishRegMsg = finishRegMsg + '\n' + '$setfavorite <FavoritePokemon>';
                }

                if (isNotComplete == 1) {
                    msg.reply('You are already registered!' + '\n' + finishRegMsg);
                }
                else {
                    msg.reply('Nice! You are already completely registered.');
                }
                return;
            }
            else {
                finishRegMsg = 'To complete your registration remember to set your information using the commands below:';
                finishRegMsg = finishRegMsg + '\n' + '$setname <TrainerName>';
                finishRegMsg = finishRegMsg + '\n' + '$setcode <TrainerCode>';
                finishRegMsg = finishRegMsg + '\n' + '$setlevel <Level>';
                finishRegMsg = finishRegMsg + '\n' + '$setfavorite <FavoritePokemon>';
            }

            // Register User
            // SQL LOG
            strSql = 'INSERT INTO tbltrainer (AccountID, NAME) VALUES (\'' + authorID + '\',\'' + authorName + '\')';

            // RUN SQL
            con.query(strSql, (error, results) => {
                if (error) {
                    msg.reply('Error registering you.');
                    console.log('SQL Error ');
                    return console.error(error.message);
                }

                // Ouput Full Results.
                var sqlRowsReturned = Object.keys(results).length;
                console.log('SQL Results');
                console.log('Rows: ' + sqlRowsReturned);
                console.log(results);

                finishRegMsg = 'To complete your registration remember to set your information using the commands below:';
                finishRegMsg = finishRegMsg + '\n' + '$setname <TrainerName>';
                finishRegMsg = finishRegMsg + '\n' + '$setcode <TrainerCode>';
                finishRegMsg = finishRegMsg + '\n' + '$setlevel <Level>';
                finishRegMsg = finishRegMsg + '\n' + '$setfavorite <FavoritePokemon>';
                msg.reply('Congratulations, You have been Registered!' + '\n' + finishRegMsg);

            });

        });

    } // END Register


    ////////////////////////
    // $SETCODE
    ////////////////////////
    else if (msgContent.substring(0, 9) == '$setcode ' || msgContent.substring(0, 9) == '$setname ' || msgContent.substring(0, 10) == '$setlevel ') {
        console.log('--- $SET-CODE/NAME/LEVEL --- ');

        // Get User ID
        var authorID = msg.author.id;
        var authorName = msg.author.username;
        if (authorID == null) {
            console.log('--- ERR --- Null AuthorID(' + authorID + ')');
            msg.reply('I am unable to get your ID right now.');
            return;
        }
        console.log('Author ID: ' + authorID);
        console.log('Author Name: ' + authorName);

        // Get User Input
        var command = '';
        var userinput;
        if (msgContent.substring(0, 9) == '$setcode ') {
            userinput = msgContent.substring(9, msgContent.length);
            command = 'setcode';
        }
        else if (msgContent.substring(0, 10) == '$setlevel ') {
            userinput = msgContent.substring(10, msgContent.length);
            command = 'setlevel';
        }
        else if (msgContent.substring(0, 9) == '$setname ') {
            userinput = msgContent.substring(9, msgContent.length);
            command = 'setname';
        }
        console.log('Command: ' + command);
        console.log('userinput: ' + userinput);

        // SQL STATEMENT
        strSql = 'SELECT PKey FROM tbltrainer WHERE AccountID =\'' + authorID + '\'';

        // RUN SQL
        console.log('- SQL RUN(' + strSql + ')');
        con.query(strSql, (error, results) => {
            if (error) {
                msg.reply(sqlDefaultErrorMsg);
                console.log('######  SQL Error  ######');
                return console.error(error.message);
            }
            console.log(results);

            // Ouput Full Results.
            var sqlRowsReturned = Object.keys(results).length;

            // Create SQL INSERT/UPDATE String and Success Message.
            var strSql2 = '';
            var successmessage = '';
            var finishRegMsg = 'To complete your registration remember to set your information using the commands below:';
            if (command == 'setname') {
                if (sqlRowsReturned < 1) {
                    strSql2 = 'INSERT INTO tbltrainer (AccountID, NAME, TrainerName) VALUES (\'' + authorID + '\',\'' + authorName + '\',\'' + userinput + '\')';
                    successmessage = 'You have been registered and your Trainer Name has been set.';
                    finishRegMsg = finishRegMsg + '\n' + '$setcode <TrainerCode>';
                    finishRegMsg = finishRegMsg + '\n' + '$setlevel <Level>';
                    isNotComplete = 1;
                }
                else {
                    strSql2 = 'UPDATE tbltrainer SET Name = \'' + authorName + '\', TrainerName = \'' + userinput + '\' WHERE AccountID = \'' + authorID + '\'';
                    successmessage = 'Your Trainer Name has been set.';
                    if ((results[0].TrainerCode == null || results[0].TrainerCode == '')) {
                        finishRegMsg = finishRegMsg + '\n' + '$setcode <TrainerCode>';
                        isNotComplete = 1;
                    }
                    if ((results[0].Level == null || results[0].Level == '')) {
                        finishRegMsg = finishRegMsg + '\n' + '$setlevel <Level>';
                        isNotComplete = 1;
                    }
                }
            }
            else if (command == 'setlevel') {
                if (sqlRowsReturned < 1) {
                    strSql2 = 'INSERT INTO tbltrainer (AccountID, NAME, Level) VALUES (\'' + authorID + '\',\'' + authorName + '\',\'' + userinput + '\')';
                    successmessage = 'You have been registered and your Trainer Level has been set.';
                    finishRegMsg = finishRegMsg + '\n' + '$setcode <TrainerCode>';
                    finishRegMsg = finishRegMsg + '\n' + '$setname <TrainerName>';
                    isNotComplete = 1;
                }
                else {
                    strSql2 = 'UPDATE tbltrainer SET Name = \'' + authorName + '\', Level = \'' + userinput + '\' WHERE AccountID = \'' + authorID + '\'';
                    successmessage = 'Your Trainer Level has been set.';
                    if (command != 'setname' && (results[0].TrainerName == null || results[0].TrainerName == '')) {
                        finishRegMsg = finishRegMsg + '\n' + '$setname <TrainerName>';
                        isNotComplete = 1;
                    }
                    if ((results[0].TrainerCode == null || results[0].TrainerCode == '')) {
                        finishRegMsg = finishRegMsg + '\n' + '$setcode <TrainerCode>';
                        isNotComplete = 1;
                    }
                }
            }
            else if (command == 'setcode') {
                if (sqlRowsReturned < 1) {
                    strSql2 = 'INSERT INTO tbltrainer (AccountID, NAME, TrainerCode) VALUES (\'' + authorID + '\',\'' + authorName + '\',\'' + userinput + '\')';
                    successmessage = 'You have been registered and your Trainer Code has been set. Type $htc to display your code to others.';
                    finishRegMsg = finishRegMsg + '\n' + '$setname <TrainerName>';
                    finishRegMsg = finishRegMsg + '\n' + '$setlevel <Level>';
                    isNotComplete = 1;
                }
                else {
                    strSql2 = 'UPDATE tbltrainer SET Name = \'' + authorName + '\', TrainerCode = \'' + userinput + '\' WHERE AccountID = \'' + authorID + '\'';
                    successmessage = 'Your Trainer Code has been set. Type $htc to display your code to others.';
                }
                if (command != 'setname' && (results[0].TrainerName == null || results[0].TrainerName == '')) {
                    finishRegMsg = finishRegMsg + '\n' + '$setname <TrainerName>';
                    isNotComplete = 1;
                }
                if ((results[0].Level == null || results[0].Level == '')) {
                    finishRegMsg = finishRegMsg + '\n' + '$setlevel <Level>';
                    isNotComplete = 1;
                }
            }

            if (isNotComplete == 1)
                successmessage = successmessage + '\n' + finishRegMsg;
            else
                successmessage = successmessage + '\n' + 'You are completely registered!';


            // RUN SQL 2
            con.query(strSql2, (error, results) => {
                if (error) {
                    msg.reply('Error registering you.');
                    console.log('SQL Error ');
                    return console.error(error.message);
                }
                console.log(results);

                // Ouput Full Results.
                var sqlRowsReturned = Object.keys(results).length;
                console.log('SQL Results');
                console.log('Rows: ' + sqlRowsReturned);

                msg.reply(successmessage);

            });


        });

    }


    ////////////////////////
    // $SETFAVE
    ////////////////////////

    return;

});


// ??
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});











function fnRandomPokemon(msg) {

    // Global Assets
    var pokemonNumber = Math.floor(Math.random() * maxNumberPkmn) + 1;
    strSql = `SELECT jsOutput FROM vewpokemoninfo WHERE PKey = \'` + pokemonNumber + `\'`;

    // RUN SQL
    console.log('- SQL RUN(' + strSql + ')');
    con.query(strSql, (error, results) => {
        if (error) {
            msg.reply(sqlDefaultErrorMsg);
            console.log('######  SQL Error  ######');
            return console.error(error.message);
        }
        console.log(results);

        // Get Amount of Rows Returned
        var sqlRowsReturned = Object.keys(results).length;
        console.log('- Rows Returned(' + sqlRowsReturned + ')');


        // PARSE & SET SUCCESS MESSAGE
        const strOutput = '';
        const strOutputMsg = '';
        if (sqlRowsReturned > 0) {
            console.log('- Parsing Begin -');
            var sqlResultsReturned = '';
            var sqlResultsReturned = results[0].jsOutput;
            //Object.keys(results).forEach(function (key) {
            //    var row = results[key];
            //    if (sqlRowsReturned == '' || sqlRowsReturned == null)
            //        sqlResultsReturned = row.jsOutput;
            //    else
            //        sqlResultsReturned = sqlRowsReturned + '\n' + row.jsOutput;
            //    console.log('- Parsing (' + row.jsOutput + ')');
            //});
            console.log('- Total Parsed: ');
            console.log(sqlResultsReturned);
            console.log('- End Parsing -');
            strOutput = sqlResultsReturned;
            strOutputMsg = sqlResultsReturned;
        }
        else {
            strOutput = null;
        }

        console.log('- Sending Output to User - ');
        console.log(strOutputMsg);
        msg.reply(strOutputMsg);
        console.log('- Sent Output to User - ');
        return strOutput;
    });
}






////////////////////////
// Abandoned Code //////
////////////////////////



            // STP Parse Results -- Get Record 1
            //const result2 = Object.values(JSON.parse(JSON.stringify(results[0])));
            //const sqlResultParsed1 = Object.values(JSON.parse(JSON.stringify(results[0])));
            //const sqlResultParsed2 = JSON.stringify(sqlResultParsed1[0]);
            //const sqlResultParsed = results[0].PokemonInfo;
            //console.log('Parse: ' + sqlResultParsed);