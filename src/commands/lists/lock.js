const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs');
const { canTreatArrayAsAnd } = require('sequelize/dist/lib/utils');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

async function subSwitch(interaction){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "lid":
            lockLid(interaction);
            break;
        
        case "tag":
            console.log("1");
            lockTag(interaction);
            break;
    }
}

async function lockLid(interaction){
    const uid = await interaction.user.id;
    const lid = await interaction.options.getInteger('lid');
    const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}})
    if (card) {
        if (card.lock) {
            await card.update({lock: false});
            return await interaction.reply(`Card ${lid} unlocked.`);
        } else {
            await card.update({lock: true});
            return await interaction.reply(`Card ${lid} locked.`);
        }
    } else {
        return interaction.reply("Invalid List ID.")
    }
}

async function lockTag(interaction){
    const uid = await interaction.user.id;
    const tag = await interaction.options.getString('tag');
    const card = await database.Card.findAll({where: {playerID: uid, tag: tag}});
    const lock = await interaction.options.getBoolean('lock');
    await database.Card.update({lock: lock}, {where: {playerID: uid, tag: tag}});
    return await interaction.reply(`Cards tagged with ${tag} locked.`);
}





module.exports = {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('Toggles lock or unlock on cards.')
        .addSubcommand(subcommand =>
            subcommand
                .setName("lid")
                .setDescription("Toggles lock or unlock for a card with lid")
                .addIntegerOption(option => 
                    option
                        .setName("lid")
                        .setDescription("The inventory id u want to lock/unlock")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("tag")
                .setDescription("Toggles lock or unlock on cards.")
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to lock/unlock.")
                        .setRequired(true)
                        )
                .addBooleanOption(option => 
                    option
                        .setName("lock")
                        .setDescription("true: lock or false: unlock?")
                        .setRequired(true)
                        )),
	async execute(interaction) {
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            subSwitch(interaction);
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};