var fs = require("fs");
var Discord = require("discord.js");

// Import GilMcBotlin data
try {
    var COMMANDS = JSON.parse(fs.readFileSync("../data/commands.json"));
} catch (e) {
    console.log(e);
}

var commandFiles = fs.readdirSync(`./commands`);
for (var file of commandFiles) {
    try {
        var command = require(`./${file}`);
        if (!Array.from(Object.keys(COMMANDS)).includes(command.name)) {
            COMMANDS[command.name] = command.aliases;
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    name: "removealias",
    args: true,
    help: "Removes aliases for commands.",
    usage: "<command> <alias> [<alias>]+",
    aliases: Array.from(COMMANDS["addalias"]),
    hide: true,
    guildOnly: true,
    modOnly: true,
    botChannelOnly: true,
    inputs: Array.from(Object.keys(COMMANDS)),
    execute: (msg, args, client) => {
        var command = args.split(" ")[0]
        if (args.split(" ").slice(1)) {
            var aliases = args.split(" ").slice(1);
        } else {
            return;
        }

        // NOTE: DOES NOT SEEM TO WORK: ALIASES ARE NOT REMOVED
        if (Array.from(Object.keys(COMMANDS)).includes(command)) {
            currAliases = Array.from(COMMANDS[command])
            aliases.forEach(function (alias) {
                if (currAliases.includes(alias)) {
                    currAliases = currAliases.filter(function (element) {
                        return element !== alias;
                    });
                }
            });

            COMMANDS[command] = currAliases;
            var writeFileError;
            fs.writeFileSync("../data/commands.json", JSON.stringify(COMMANDS), (err) => {
                if (err) {
                    console.log(err);
                    writeFileError = true
                }
            });

            if (!writeFileError) {
                var isAre;
                if (aliases.length === 1) {
                    isAre = "is"
                } else if (aliases.length > 1) {
                    isAre = "are"
                }
                var aliasesText = `📜 ${aliases.join(" ")} ${isAre} no longer an alias for ${command}. \`${client.PREFIX}${command} ${Array.from(COMMANDS[command]).join("|")}\` is now valid.`;
                msg.channel.send({
                    embed: {
                        color: client.SUCCESS_COLOUR,
                        description: aliasesText
                    }
                });
            }
            // Reload the command
            client.loadCommand(command);
        }
    }
}