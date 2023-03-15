const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('diaset')
		.setDescription('Sets a diamond card to an image number')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The inventory id of the diamond card.")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("imagenumber")
                .setDescription("The image number to set to. Negative value is for gifs.")
                .setRequired(true)
                ),
	async execute(interaction) {
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            const uid = interaction.user.id;
            const lid = interaction.options.getInteger('lid');
            const iNumber = interaction.options.getInteger('imagenumber');
            const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}});
            if (iNumber == 0) {
                return interaction.reply(`0 is not a valid image number.`)
            }
            if (card) {
                if (card.rarity >= 6) {
                    if (iNumber > 0) {
                        const image = await database.Image.findOne({where: {characterID: card.characterID, imageNumber: iNumber}});
                        if (image) {
                            card.update({imageNumber: iNumber, imageID: image.imageID});
                            return interaction.reply(`Card ${lid} has updated image to image ${iNumber}`)
                        }
                        return interaction.reply(`Image not found make sure the image number exists.`)
                        
                    } else if (iNumber < 0) {
                        const gif = await database.Gif.findOne({where: {characterID: card.characterID, gifNumber: -iNumber}});
                        if (gif) {
                            card.update({imageNumber: iNumber, imageID: -gif.gifID});
                            return interaction.reply(`Card ${lid} has updated image to gif ${-iNumber}`)
                        }
                        return interaction.reply(`Gif not found make sure the image number exists.`)
                    }
                } else {
                    return interaction.reply(`Card ${lid} is not a Ruby Card. Check your list.`)
                }
            } else {
                return interaction.reply(`Card ${lid} doesn't exist. Check your list.`)
            }
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};