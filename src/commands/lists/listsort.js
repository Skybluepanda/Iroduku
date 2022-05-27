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
async function lstart(){
    const uid = interaction.user.id;
    const lstart = interaction.options.getInteger('startlid')
    cardList = await database.Card.findAll({})


}

async function inventorycheck(uid) {
    var notfound = true;
    var i = 1;
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
    const order = interaction.options.getInteger("order");
    switch (order){
        case 1:
            return ['rarity','DESC'];
        
        case 2:
            return ['inventoryID','DESC'];

        case 3:
            return ['createdAt','DESC'];
        case 4:
            return ['createdAt','ASC'];
        case 5:
            return ['characterID', 'ASC']
        default:
            return ['inventoryID','ASC']
    }
}

async function lsort(interaction, progress){

}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('lsort')
		.setDescription('Sorts your unlocked cards in a order starting from a specific lid in the order of age.')
        //base
        .addIntegerOption(option => 
            option
                .setName("startlid")
                .setDescription("The starting lid for the list to fill up from.")
                .setRequired(false)
                )
        .addIntegerOption(option => 
            option
                .setName("order")
                .setDescription("Order cards to a standard")
                .setRequired(false)
                .addChoice('rarity',1)
                .addChoice('reverse',2)
                .addChoice('newest',3)
                .addChoice('oldest',4)
                .addChoice('cid',5)
                ),
	async execute(interaction) {
        try {
            const uid = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: uid}});
            if (player) {
                //do list sort
                await lstart();

            } else {
                return interaction.reply("You are not a registered player, do /isekai to get started!");
            }
            
        } catch (error) {
            return interaction.reply("Error has occured");
        }
	},
};