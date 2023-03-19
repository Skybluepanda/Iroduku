const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');


async function newTagList(interaction, uid) {
    try {
        const tags1 = await interaction.options.getString("tag1");
        const tags2 = await interaction.options.getString("tag2");
        const tags3 = await interaction.options.getString("tag3");
        const tags4 = await interaction.options.getString("tag4");
        const tags5 = await interaction.options.getString("tag5");
        await database.Listtags.create({
            playerID: uid,
            tag1: tags1,
            tag2: tags2,
            tag3: tags3,
            tag4: tags4,
            tag5: tags5,
        });
        const embed = new MessageEmbed();
        embed.setTitle("Taglist Created")
                .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
                .setDescription(`${tags1} ${tags2} ${tags3} ${tags4} ${tags5}`).setColor(color.successgreen);
        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        return interaction.reply("Error has occured, you might need to enter 5 emotes for first time using this command.")
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lvtedit')
        .setDescription('list view tag edit menu')
        .addStringOption(option => 
            option
                .setName("tag1")
                .setDescription("Tag to change the tag slot to, keep null to not change.")
                .setRequired(false)
                )
        .addStringOption(option => 
            option
                .setName("tag2")
                .setDescription("Tag to change the tag slot to, keep null to not change.")
                .setRequired(false)
                )
        .addStringOption(option => 
            option
                .setName("tag3")
                .setDescription("Tag to change the tag slot to, keep null to not change.")
                .setRequired(false)
                )
        .addStringOption(option => 
            option
                .setName("tag4")
                .setDescription("Tag to change the tag slot to, keep null to not change.")
                .setRequired(false)
                )
        .addStringOption(option => 
            option
                .setName("tag5")
                .setDescription("Tag to change the tag slot to, keep null to not change.")
                .setRequired(false)
                ),
    async execute(interaction) {
        try {
            console.log('1')
            const uid = await interaction.user.id;
            console.log('2')
            const tags1 = await interaction.options.getString("tag1");
            const tags2 = await interaction.options.getString("tag2");
            const tags3 = await interaction.options.getString("tag3");
            const tags4 = await interaction.options.getString("tag4");
            const tags5 = await interaction.options.getString("tag5");
            console.log(3);
            const taglist = await database.Listtags.findOne({where: {playerID: uid}});
            if(taglist){
                if(tags1) {
                    await taglist.update({tag1:tags1});
                }
                if(tags2) {
                    await taglist.update({tag2:tags2});
                }
                if(tags3) {
                    await taglist.update({tag3:tags3});
                }
                if(tags4) {
                    await taglist.update({tag4:tags4});
                }
                if(tags5) {
                    await taglist.update({tag5:tags5});
                }
                const embed = new MessageEmbed();
    embed.setTitle("Taglist Edited")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`${taglist.tag1} ${taglist.tag2} ${taglist.tag3} ${taglist.tag4} ${taglist.tag5}`).setColor(color.successgreen);
                return interaction.reply({ embeds: [embed] });
            } else {
                newTagList(interaction, uid);
            }
            
        }
             catch (error) {
        }
    },
};