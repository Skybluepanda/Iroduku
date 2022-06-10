const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');

async function start(interaction) {
    const user = interaction.user.id;
    let cid;
    const track = await database.Votetrack.findOne({
        where: {playerID: user}
    });
    if (track) {
        cid = await track.charVote;
    } else {
        await database.Votetrack.create({
            playerID: user
        });
        cid = 2;
    }
    
    const embed = await createEmbed(interaction);
    await interaction.reply({embeds: [embed]});
    await cvoteID(embed, interaction, cid);
}

function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Starting charvote")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Starting")
        .setColor(color.failred);
    return embed;
}

async function viewImage(embed, interaction, cid, inumber) {
    try {
        let art;

        art = await database.Image.findOne({
        where: {
            characterID: cid,
            imageNumber: inumber,
        }})
        if (!art && inumber > 11) {
            return await viewImage(embed, interaction, cid, inumber+1);
        } else {
            const url = art.imageURL;
            const artist = art.artist;
            const uploader = art.uploader;
            const footer = `
            #${art.imageNumber} Art by ${artist} | Uploaded by ${uploader}\nImage ID is ${art.imageID} report any errors using ID.
            `;
            await embed
                .setImage(url)
                .setFooter({text: `${footer}`});
            await interaction.editReply({embeds: [embed]});
        }
        
    } catch(error) {
        console.log("error has occured with view image");
    }
}

async function cvoteID(embed, interaction, cid) {
    try {
        const char = await database.Character.findOne({
            where: {
                characterID: cid
            }
        });
        if (char) {
            if (char.imageCount > 0){
                await viewImage(embed, interaction, cid, 1);
            } else {
                embed.addField('No images found', 'add some', true);
            }
        const series = await database.Series.findOne({ where: { seriesID: char.seriesID}})
        await embed
            .setDescription(`
Character ID: ${char.characterID}
Character Alias: ${char.alias}
Series: ${char.seriesID} | ${series.seriesName}

Please vote carefully and honestly. You will be rewarded 4 gems per vote
This will impact the game's gacha pool.
Vote 0 for characters you have 0 idea who they are.
Vote 1 for characters you know.
Vote 2 for characters you would love to collect.
Your wishlist will also count towards total votes, for those who are looking to boost their waifus.
Do not peer pressure or bribe people to influence this vote. Or I'll need to reset or adjust it.
If the image isn't updated, it means they don't have a pic 1.
`)
            .setTitle(`${char.characterName}`)
            .setColor(color.successgreen);
        const row = await createButton();
        msg = await interaction.editReply( {embeds: [embed], components: [row], fetchReply: true});
        await buttonManager(embed, interaction, msg, cid);
        } else {
            await embed.setDescription(`You are done for now as there are no new characters.
There will be a command in the future to let you know if there are new characters to vote for.
Thank you so much for doing cvote!`);
            return await interaction.editReply( {embeds: [embed]});
        }
    } catch(error) {
        console.log("error has occured in cinfoID.");
    }
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('0')
                    .setLabel('0')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('1')
                    .setLabel('1')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('2')
                    .setLabel('2')
                    .setStyle('PRIMARY'))
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(embed, interaction, msg, cid) {
    try {
        const uid = interaction.user.id;
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case '0':
                    await database.Votetrack.increment({charVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1}, {where: {characterID: cid}});
                    cvoteID(embed, interaction, cid+1);
                    break;
                
                case '1':
                    await database.Votetrack.increment({charVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1, score: 1}, {where: {characterID: cid}});
                    cvoteID(embed, interaction, cid+1);
                    break;
                
                case '2':
                    await database.Votetrack.increment({charVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1, score: 2}, {where: {characterID: cid}});
                    cvoteID(embed, interaction, cid+1);
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}




module.exports = {
	data: new SlashCommandBuilder()
		.setName('cvote2')
		.setDescription('vote for the character pools to earn gems!'),
	async execute(interaction) { 
        try {
            const uid = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: uid}});
            if (player) {
                start(interaction);
            } else {
                await interaction.reply("You are not a registered player. Use /isekai to get started.")
            }
            
        } catch(error) {
            await interaction.reply("Error has occured while performing the command.")
        }        
    }
}