"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("./Command");
const Config_1 = require("../Config/Config");
class HelpCommand extends Command_1.default {
    constructor() {
        super(...arguments);
        this.command = "help";
    }
    handle(parameter, message, connection) {
        const prefix = Config_1.default.prefix;
        const reply = {
            color: 0xA2E13D,
            author: {
                'name': 'ℹ️ Available commands',
                'url': 'https://discord.gg',
            },
            description: `
**${prefix}help** *List commands*
**${prefix}play** [query|url] *Add a song to queue*
**${prefix}pause** *Pause current song*
**${prefix}resume** *Resume current song*
**${prefix}queue** *List queue*
**${prefix}skip** *Skip current song*
**${prefix}np** *Show the song that is currenty playing*
**${prefix}remove** [index] *Remove a song from the playlist (hint: say '${prefix}queue' to see indexes)*
**${prefix}volume** [0-100] *Set the volume*
**${prefix}mute** *Mute me*
**${prefix}unmute** *Unmute me*
**${prefix}clearqueue** *Clears queue and stops playing*
**${prefix}disconnect** *Disconnect the bot*
`
        };
        connection.channel.send('', { embed: reply });
    }
}
exports.default = HelpCommand;
//# sourceMappingURL=HelpCommand.js.map