var parseMessage = function(args) {
	var intervalList	= ["seconds", "minutes", "hours", "days", "weeks", "months", "years"];
	var argsList		= args.split(" ");

	// First, check if the user has passed a valid date or datetime.
	try {
		// Splits on " because the command may be [+remindme 2:00 05/05/2018 "Check that out"].
		// We just want to check the 2:00 05/05/2018 part, and the +remindme has already been trimmed.
		var newDT = moment(args.split("\"")[0].trim());
	}
	catch (e) {
		// Either the user only gave a time, in which case, set the new datetime to be that time,
		// or, they didn't provide anything.
		var reg = /(\d{1,2}\:\d{2})/g;
		if (args.match(reg)) {
			var time	= args.match(reg)[1];
			var hours	= time.split(":")[0];
			var minutes	= time.split(":")[1];
			var newDT	= moment();

			// Set the current day's hour to the given hour, and likewise for minute.
			newDT.hour(hours);
			newDT.minute(minutes);
			return newDT;
		}
		else {
			var errorText =	`<@${user.id}>: Error using RemindMe: \`${args}\` didn't contain a time, date, or a time interval! `+
							`RemindMe only works with a time and/or date (e.g. \`19:00\`, or \`12:00 31/12/2018\`), OR, with a number and length (e.g. \`7 days\`).\n`+
							`Please use "+help" for further help.`;
			formatMessage.sendNotification(errorText, "error", msg);
			return null;
		}
	}

	// If no time was given, check to see if any of the time intervals were passed, e.g. 7 days, 12 minutes, 1 hour.
	// If it has, find the number and the interval, and add it.
	for (var interval of intervalList) {
		if (argsList.some(interval) || argsList.some(interval.slice(0,-1))) {
			var intervalValue	= interval;
			var quant			= argList.filter(arg => arg === parseInt(arg, 10));
			if (quant.length !== 1) {
				var errorText =	`<@${user.id}>: Error using RemindMe: \`${args}\` had too many numerical arguments! `+
								`RemindMe only works with a time and/or date (e.g. \`19:00\`, or \`12:00 31/12/2018\`), OR, with a number and length (e.g. \`7 days\`).\n`+
								`Please use "+help" for further help.`;
				formatMessage.sendNotification(errorText, "error", msg);
				return null;
			}
			else {
				quant		= quant[0];
				var newDT	= moment().add(quant, intervalValue);
				return newDT;
			}
		}
	}
}

module.exports = {
	name:		"remindme",
	args:		true,
	help:		"Set Gil to post when the time is up. +bbl `your bbl team`.",
	usage: 		"<number> <years/months/weeks/hours/minutes/seconds> [<\"note\">], or <time> [<date>] [<\"note\">]",
	aliases:	["remind", "reminder"],
	hide:		false,
	guildOnly:	false,

	execute: (msg, args) => {
		var error = false;

		// Load message format methods
		try {
			var formatMessage = require('../formatmessage.js');
		} catch (e) {
			console.log("Unable to load message formatting methods:\n" + e);
			error = true;
		}

		// Import Moment
		try {
			var moment = require("moment");
		} catch (e) {
			console.log("moment missing. Run `npm install` first.");
			error = true;
		}

		// Import mysql
		try {
			var mysql = require("mysql");
		} catch (e) {
			console.log("mysql missing. Run `npm install` first.");
			error = true;
		}

		// Load config file
		try {
			var config = require("../config.json");
		}
		catch (e) {
			console.log("Unable to parse config file: " + e);
			error = true;
		}

		if (error) {
			try {
				formatMessage.sendNotification("There was an error loading this command.", "error", msg);
				return;
			} catch (e) {
				msg.reply("There was an error loading this command.", "error", msg);
				return;
			}
		}

		var mysqlUser	= config.dbuser;
		var mysqlPass	= config.dbpass;
		var con			= mysql.createConnection({
			host:		"localhost",
			user:		mysqlUser,
			password:	mysqlPass,
			database:	"remindme"
		});

		var server		= msg.guild;
		var user		= msg.member;
		var originDT	= moment().format("YYYY-MM-DD HH:mm:ss");

		var newDT		= parseMessage(args).format("YYYY-MM-DD HH:mm:ss");
		if (!newDT) {
			return;
		}

		con.connect(err=>{
			if (err) {
				console.log(err);
				return;
			}
		});

		con.query("INSERT INTO remindme (`messageID`, `note`, `new_date`, `origin_date`, `userID`) VALUES ?;", [[${msg.id}, ${note}, ${newDT}, ${originDT}, ${msg.author.id}]], (err, rows) => {
			if (err) {
				console.log(err);
				return;
			}

			var remindText	=	`⌚ I'll message you on ${newDT.format("dddd, MMMM Do YYYY, h:mm:ss a ZZ")} to remind you:\n`+
								`\`${note}\``;
			var colour		= 0x33b23b;
			var embed		= {
				color: colour,
				description: remindText
			};

			msg.author.createDM("", {embed});
		});

		con.end(err => {
			console.log(err);
		});
	}
}