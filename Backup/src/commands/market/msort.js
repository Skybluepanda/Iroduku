const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');

//how to do lsort
/**
 * We want to check all cards. So lets scan by lid.
 * Starting with the lid 1, place them in the starting lid if it matches the order.
 * Then go to next lid or card in order
 * If the target slot is occupied, place the card in next slot.
 * By default starting lid will be 0 and try to fill cards into the list from 1.(but this will most likely result in inverting lid as )
 * 
 * Filters?
 * Rarity, series, character, tag
 * Order Newest, oldest, lid
 * Starting value
 * 
 * Move cards of rarity, character, series, tag
 * Sort cards by newest, oldest or lid.
 *  */

//We want to recursively activate cards in the order after the filter, then start filling from the point
async function inventorycheck(uid, start) {
    var notfound = true;
    var i = start;
    while (notfound) {
        const number = await database.Card.findOne({where: {playerID: uid, inventoryID: i}})
        if (number) {
            i += 1;
        } else {
            notfound = false;
        }
    }
    return i;
}

async function order(interaction) {
    const order = await interaction.options.getInteger("order");
    switch (order){
        case 1:
            return ['rarity','DESC'];

        case 3:
            return ['createdAt','DESC'];

        case 4:
            return ['createdAt','ASC'];

        case 5:
            return ['characterID', 'ASC']

        default:
            return ['cardID','ASC']
    }
}

async function lsort(interaction){
    console.log(4)
    const uid = '903935562208141323';
    const orderOpt = await order(interaction);
    console.log(1)
    var lid = interaction.options.getInteger('startlid');
    console.log(2)
    const sortlist = await database.Card.findAll({order: [orderOpt], where: {playerID: uid, lock: 0}})
    await database.Card.update({inventoryID: 0}, {where: {playerID: uid, lock: 0}});
    console.log(3)
    var total = await database.Card.count({where: {playerID: uid, lock: 0}});
    console.log(5)
    await interaction.reply(`${total} cards being sorted in order ${orderOpt}, starting from LID ${lid}.
Please do not execute or interact with any other commands until the commmand has finished. Any cards that are lost cannot be recovered.
Please wait, you will be alerted once sorting is complete.`)
    console.log(6)
    for (let i = 0; i < total; i++) {
        console.log(7)
        lid = await inventorycheck(uid, lid);
        console.log(lid);
        console.log(8)
        await database.Card.update(
            {
                tag: null,
                inventoryID: lid
            },
            {
                limit: 1,
                where:  {
                    cardID: sortlist[i].cardID,
                    inventoryID: 0,
                    playerID: uid,
                    lock: 0
                }
            }
        )
        console.log(9)
        lid += 1;
    }
    await interaction.channel.send(`${interaction.user} sorting complete, you may use other commands.`)
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('msort')
		.setDescription('Srots market')
        //base
        .addIntegerOption(option => 
            option
                .setName("startlid")
                .setDescription("The starting lid for the list to fill up from.")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("order")
                .setDescription("Order cards to a standard")
                .setRequired(false)
                .addChoice('rarity',1)
                .addChoice('newest',3)
                .addChoice('oldest',4)
                .addChoice('cid',5)
                ),
	async execute(interaction) {
        try {
            if (!interaction.member.roles.cache.has('947442920724787260')) {
                return interaction.reply("You don't have the gemmod role!");
            };
            console.log(1)
            const uid = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: uid}});
            console.log(2)
            if (player) {
                const startlid = await interaction.options.getInteger('startlid')
                if (startlid <= 0){
                    return interaction.reply("Start LID cannot be less than 1.");
                }
                //do list sort
                console.log(3)
                await lsort(interaction);

            } else {
                return interaction.channel.reply("You are not a registered player, do /isekai to get started!");
            }
            
        } catch (error) {
            return interaction.channel.send("Error has occured");
        }
	},
};