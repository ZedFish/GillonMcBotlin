var fs = require("fs");
var yaml = require("yamljs");

// Import GilMcBotlin data
try {
    var COMMANDS = yaml.load("../data/commands.yml");
} catch (e) {
    console.log(e);
}

var commandFiles = fs.readdirSync(`./commands`);
for (var file of commandFiles) {
    try {
        var command = require(`./commands/${file}`);
        var commandAliases = command.aliases
        var commandName = command.name
        if (!Array.from(Object.keys(COMMANDS)).includes(commandName)) {
            COMMANDS[commandName] = commandAliases;
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    name: "addalias",
    args: true,
    help: "Adds aliases for commands.",
    usage: "<command> <alias> [<alias>]+",
    aliases: Array.from(COMMANDS["addalias"]),
    hide: true,
    guildOnly: true,
    modOnly: true,
    botChannelOnly: false,
    inputs: Array.from(Object.keys(COMMANDS)),
    execute: (msg, args, client) => {
        var command = args.split(" ")[0]
        if (args.split(" ").slice(1)) {
            var aliases = args.split(" ").slice(1);
        }

        if (Array.from(Object.keys(COMMANDS)).includes(command)) {
            currAliases = Array.from(COMMANDS[command])
            aliases.forEach(function (alias) {
                if (!currAliases.contains(alias)) {
                    currAliases.push(alias)
                }
            });
            COMMANDS[command] = currAliases;
        }

        fs.writeFile("../data/commands.yml", COMMANDS, (err) => {
            if (err) {
                console.log(err);
            } else {
                var isAre;
                if (aliases.length === 1) {
                    isAre = "is"
                } else {
                    isAre = "are"
                }
                var aliasesText = `📜 ${aliases.join(" ")} ${isAre} now an alias for ${command}! \`${client.PREFIX} ${command} ${Array.from(COMMANDS[command]).join("|")}\` is now valid.`;
                msg.channel.send({
                    embed: {
                        color: client.SUCCESS_COLOUR,
                        description: aliasesText
                    }
                });
            }
        });
    }
}