const { SlashCommandBuilder } = require('@discordjs/builders');
const database3 = require('../../database3.js');
const { Op } = require('@sequelize/core');


async function checkSlots(cid) {
    const wishlist = database3.Wishlist.findOne({});
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('wadd')
        .setDescription('Add or replaces a character into wishlist')
        .addIntegerOption(option => 
            option.setName('cid')
                .setDescription('Character ID.')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('slot')
                .setDescription("Slot you want to add into, (1-20).")
                .setRequired(true)),
    async execute(interaction) {
        try {
            const uid = interaction.user.id;
            const wishlist = database3.Wishlist.findOne({where: {playerID: uid}});
            const slotNo = interaction.options.getInteger('slot')
            const slot = 'slot' + slotNo;
            console.log(slot);
            if (wishlist) {
                if (checkSlots(cid)){
                    //add to wishlist
                } else {
                    return interaction.reply(`${cid} is already in your wishlist.`)
                }
                //add to wishlist
            } else {
                const wishlist = database3.Wishlist.create({
                    playerID: uid,
                });


            }
        } catch (error) {
        }
    },
};