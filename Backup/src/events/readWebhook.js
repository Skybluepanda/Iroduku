const database = require('../database');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

module.exports = {
	name: 'readWebhook',
	async execute(message) {
        if (message.channel.id === '949217377776726116') {
            console.log('message found.');
            if (message.webhookId) {
                //do things
                console.log('reading webhook.');
                const uid = message.mentions.users.first().id;
                console.log(uid);
            } else {
                return;
            }
        } else {
            return
        }
	},
};