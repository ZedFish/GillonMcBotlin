var fs = require("fs");

// Import GilMcBotlin data
try {
    var COMMANDS = JSON.parse(fs.readFileSync("../data/commands.json"));
    var GROUPS = JSON.parse(fs.readFileSync("../data/groups.json"));
} catch (e) {
    console.log(e);
}

module.exports = {
    name: "removegroup",
    args: true,
    help: "Adds a new group and role.",
    usage: "<command> <alias> [<alias>]+",
    aliases: Array.from(COMMANDS["removegroup"]),
    hide: true,
    guildOnly: true,
    modOnly: true,
    botChannelOnly: true,
    inputs: Array.from(Object.keys(COMMANDS)),
    execute: (msg, args, client) => {
        var guild = msg.guild;
        var groupName = args;
        var role = guild.roles.find(role => role.name === groupName);

        role.delete(`Removed by ${msg.member.displayName} by +removegroup command.`)
            .then(deleted => {
                delete GROUPS[deleted.name];
                var writeFileError;
                fs.writeFileSync("../data/groups.json", JSON.stringify(GROUPS), (err) => {
                    if (err) {
                        console.log(err);
                        writeFileError = true;
                    }
                });
                if (!writeFileError) {
                    var aliasesText = `📜 ${groupName} is now an group! Its aliases are \`${aliases.join(" ")}\``;
                    msg.channel.send({
                        embed: {
                            color: client.SUCCESS_COLOUR,
                            description: aliasesText
                        }
                    });
                }
            })
            .catch(err => {
                var aliasesText = `❌ ${groupName} is not an existing group.`;
                msg.channel.send({
                    embed: {
                        color: client.SUCCESS_COLOUR,
                        description: aliasesText
                    }
                });
            })
    }
}