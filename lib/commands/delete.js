// Import yaml
var yaml = require("yamljs");

// Import GilMcBotlin data
try {
    var COMMANDS = yaml.load("../data/commands.yml");
} catch (e) {
    console.log(e);

}module.exports = {
    name: "delete",
    args: true,
    help: "Moderator command. Deletes a specified number of messages.",
    usage: "<number of messages>",
    aliases: Array.from(COMMANDS["delete"]),
    hide: true,
    guildOnly: true,
    modOnly: true,
    botChannelOnly: false,
    inputs: "Number of messages to delete",
    execute: async (msg, args, client) => {
        var member = msg.member;
        var quant = parseInt(args);

        msg.channel.fetchMessages({
                limit: quant + 1
            })
            .then(messages => {
                msg.channel.bulkDelete(messages)
                    .then(deletedMessages => {
                        var removeText = `❌ ${deletedMessages.size - 1} messages have been removed by <@${member.id}>.`;
                        msg.channel.send({
                            embed: {
                                color: client.SUCCESS_COLOUR,
                                description: removeText
                            }
                        });
                    })
                    .catch(e => {
                        console.log(e)
                    })
            })
            .catch(e => {
                console.log(e)
            })
    }
}