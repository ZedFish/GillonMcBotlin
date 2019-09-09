var loadError = false;

// Import yaml
try {
    var yaml = require("yamljs");
} catch (e) {
    console.log("yamljs missing. Run `npm install` first.");
    loadError = true;
}

// Import GilMcBotlin data
try {
    var groups = yaml.load("../data/groups.yml");
    var groupNames = yaml.load("../data/groupnames.yml");
} catch (e) {
    console.log("Could not load groups.yml and/or groupnames.yml. Make sure they\'re in the gilmcbotlin/data/ directory and are valid yml.");
    loadError = true;
}

var checkLoad = function (msg) {
    if (loadError) {
        var loadErrorEmbed = {
            color: 0xe24540, // red
            description: "There was an error loading this command."
        };
        msg.channel.send({
                embed: loadErrorEmbed
            })
            .catch(e => {
                console.log(
                    `LoadCommand Error:\n` +
                    `${e}\n` +
                    `Member: ${msg.author.displayName}\n` +
                    `Channel: ${msg.channel.name}\n`
                );
            });
        return;
    }
}

module.exports = {
    name: "ungroup",
    args: true,
    help: "Remove a gaming group.",
    usage: "<group>",
    aliases: ["leavegroup", "removegame", "ungame"],
    hide: false,
    guildOnly: true,
    modOnly: false,
    inputs: groups,

    execute: (msg, args) => {
        checkLoad(msg);

        var botChannel = msg.guild.channels.get("253192230200803328"); //bot_spam

        if (msg.channel !== botChannel) {
            return;
        }

        var guild = msg.guild;

        var member = msg.member;
        if (!Object.values(groupNames).includes(args)) {
            /* If the request group is not a real group (not in groups array) */
            /* The user didn't input a real group, so we will inform them it failured */
            var errorText = `🚫 🎮 CLEARLY NOT A GADGET-TYPE OPERATOR! <@${member.id}>: \`${args}\` is not an accepted input!\n` +
                `Refer to the following for help, or consult a computer-type boffin.`;

            errorText += `\nThe correct usage is: \`+${module.exports.name} ${module.exports.usage}\``;
            if (module.exports.aliases) {
                errorText += `\nOther usages allowed are:`
                for (var alias in module.exports.aliases) {
                    errorText += `\n\`+${module.exports.aliases[alias]} ${module.exports.usage}\``;
                }
            }

            var errorEmbed = {
                color: 0xe24540, // red
                description: errorText
            };

            msg.channel.send({
                embed: errorEmbed
            });
            return;
        } else {
            var roleName;
            var toRemove;
            var memberRoles = Array.from(member.roles.values());

            /*  We look into our groups.yml file and find out
             *  which group corresponds to our argument string.
             */
            Array.from(Object.keys(groups)).forEach(function (groupName) {
                if (groups[groupName].includes(args)) {
                    roleName = groupName;
                } else {
                    return;
                }
            });

            Array.from(guild.roles.values()).forEach(function (role) {
                if (role.name == roleName) {
                    toRemove = role;
                } else {
                    return;
                }
            });

            if (member.roles.has(toRemove.id)) {
                var dropArray = [];
                dropArray.push(toRemove);
                member.removeRoles(dropArray);

                // console.log(`@${user.displayName} is no longer a part of the ${toRemove.name} group!`)
                var noGroupText = `❎ <@${member.id}> is no longer a part of the ${toRemove.name} group!`;
                var noGroupEmbed = {
                    color: 0x33b23b, // green
                    description: noGroupText
                };
                msg.channel.send({
                    embed: noGroupEmbed
                });
            } else {
                var notInGroupText = `🤔 <@${member.id}>: You're not a part of the ${toRemove.name} group, so you cannot be removed from it.`;
                var notInGroupEmbed = {
                    color: 0xe2a640, // yellow
                    description: notInGroupText
                };
                msg.channel.send({
                    embed: notInGroupEmbed
                });
            }
        }
    }
}