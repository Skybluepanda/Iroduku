const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, Collection} = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()