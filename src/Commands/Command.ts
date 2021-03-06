import Client from "../ActiveConnection/Client";
import VoiceConnections from "../ActiveConnection/VoiceConnections";
import {GuildMember, Message, TextChannel} from "discord.js";
import VoiceConnection from "../ActiveConnection/VoiceConnection";
import Config from "../Config/Config";

export default abstract class Command
{
    private connection:VoiceConnection;
    private message:Message;

    constructor() {
        Client.instance.on("message", (message:Message) => {
            if(message.author.bot) return;
            const connect = VoiceConnections.getOrCreate(message.guild);
            this.message = message;
            connect.then( (connection:VoiceConnection) => {
                if( !message.content.startsWith(`${connection.prefix}${this.command}`) &&
                    !( message.content.startsWith(`${Config.prefix}help`) && this.command == 'help' ))
                    return;

                connection.channel = <TextChannel>message.channel;
                this.connection = connection;

                if( message.member.hasPermission('ADMINISTRATOR') )
                    return this.prepareHandle(message, connection);

                if( !this.requiresDJRole(connection) && !this.adminOnly )
                    return this.prepareHandle(message, connection);

                if( this.requiresDJRole(connection) && message.member.roles.exists('id', connection.djRole) )
                    return this.prepareHandle(message, connection);

                if( !this.requiresDJRole(connection) && this.adminOnly )
                    message.reply(`This command is for administrators only`).then((msg: Message) => {
                        msg.delete(Config.message_lifetime);
                    });
                else
                    message.reply(`You need the DJ role to do this`).then((msg: Message) => {
                        msg.delete(Config.message_lifetime);
                    });
            }).catch( err => {
                message.reply(err);
            } );
        });
    }

    public prepareHandle(message:Message, connection:VoiceConnection):void {
        if( !this.requiresVoiceChannel || (this.requiresVoiceChannel && connection.voiceChannel !== undefined)){
            this.handle(message.content.replace(connection.prefix+this.command, '').trim(), message, connection);
            return null;
        }
        if( Command.setVoiceChannel(message, connection) )
             this.handle(message.content.replace(connection.prefix+this.command, '').trim(), message, connection);
    }

    public requiresDJRole(connection:VoiceConnection):boolean {
         return (connection.djCommands[this.command] !== undefined && connection.djCommands[this.command] === true);
    }

    public static setVoiceChannel(message:Message, connection:VoiceConnection, checkIfJoined:boolean = true):boolean {
        if( checkIfJoined && connection.voiceChannel !== undefined )
            return true;

        if( message.member.voiceChannel === undefined) {
            message.reply('You must be in a voice channel to summon me')
                .then( (msg: Message) => {
                    msg.delete(Config.message_lifetime);
                });
            return false;
        }

        if( !message.member.voiceChannel.joinable ){
            message.reply('I am not allowed to join this channel')
                .then( (msg: Message) => {
                    msg.delete(Config.message_lifetime);
                });
            return false;
        }

        if( !message.member.voiceChannel.speakable ){
            message.reply('I am not able to play songs in this channel')
                .then( (msg: Message) => {
                    msg.delete(Config.message_lifetime);
                });
            return false;
        }

        const match = connection.disallowedVoiceChannels.find( el => {
            return el == message.member.voiceChannel.id;
        });

        if( match != null ){
            message.reply(`I am not allowed to join this channel`).then((msg: Message) => {
                msg.delete(Config.message_lifetime);
            });
            return false;
        } else {
            connection.voiceChannel = message.member.voiceChannel;
            connection.voiceChannel.join();
            connection.setDisconnectTimer();
            return true;
        }
    }

    public adminOnly:boolean = false;
    public requiresVoiceChannel:boolean = false;
    public abstract command:string;

    public abstract handle(parameter:string, message:Message, connection:VoiceConnection): void
}