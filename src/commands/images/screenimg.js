const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');

async function start(interaction) {
    const user = interaction.user.id;
    const embed = await createEmbed(interaction);
    await interaction.reply({embeds: [embed]});
    await cvoteID(embed, interaction, 0);
}

function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Starting image screen")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Starting")
        .setColor(color.failred);
    return embed;
}

async function cvoteID(embed, interaction, queue) {
    try {
        console.log("1");
        const sent = await database.Sendqueue.findOne({
            order: [['imageID','ASC']],
            offset: queue
        });
        console.log("2");
        if (sent) {
            console.log("3");
            const char = await database.Character.findOne({
                where: {
                    characterID: sent.characterID
                }
            });
            if (!char) {
                embed.setDescription("Broken Character, decline.")
                const row = await createButton();
        console.log("6");
        msg = await interaction.editReply( {embeds: [embed], components: [row], fetchReply: true});
        console.log("7");
        await buttonManager(embed, interaction, msg, queue);
            }
            const series = await database.Series.findOne({ where: { seriesID: char.seriesID}});
            console.log("5");
        await embed.setDescription(`
Image ID: ${sent.imageID}
Character ID: ${sent.characterID}
Character Alias: ${char.alias}
Series: ${char.seriesID} | ${series.seriesName}
Image Number: ${sent.imageNumber}
Uploader: ${sent.uploader}
Artist: ${sent.artist}
Nsfw: ${sent.nsfw}
Selfcrop: ${sent.selfcrop}
Reason: ${sent.reason}

Bonus: ${sent.bonus} (25gems&1karma/bonus)`).setTitle(`${char.characterName}`)
            .setColor(color.successgreen)
            .setImage(sent.imageURL);
        const row = await createButton();
        console.log("6");
        msg = await interaction.editReply( {embeds: [embed], components: [row], fetchReply: true});
        console.log("7");
        await buttonManager(embed, interaction, msg, queue);
        } else {
            await embed.setDescription(`You are done for now as there are no new images in queue.`);
            return await interaction.editReply( {embeds: [embed]});
        }
    } catch(error) {
        console.log("error has occured in cvoteID.");
    }
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('approve')
                    .setLabel('approve')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('decline')
                    .setLabel('decline')
                    .setStyle('DANGER')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('addbonus')
                    .setLabel('addbonus')
                    .setStyle('PRIMARY'))
            .addComponents(
                new MessageButton()
                    .setCustomId('removebonus')
                    .setLabel('removebonus')
                    .setStyle('PRIMARY'))
            .addComponents(
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('next')
                    .setStyle('PRIMARY'))
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}


async function buttonManager(embed, interaction, msg, queue) {
    try {
        const checker = await database.Player.findOne({where: {playerID: interaction.user.id}});
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });

        const sent = await database.Sendqueue.findOne({
            order: [['imageID','ASC']],
            offset: queue
        });
        // const sender2 = await msg.guild.members.cache.get(await sent.uploaderid);
        // console.log(sender2);
        // const senderid = `'${sent.uploaderid}'`;
        // console.log(typeof sent.uploaderid);
        // console.log(sent.uploaderid);
        // console.log(typeof interaction.user.id);
        // console.log(typeof senderid);
        
        
        
        
        
        collector.on('collect', async i => {
            switch (i.customId){
                case 'approve':
                    const image = await database.Image.create({
                        characterID: sent.characterID,
                        imageNumber: sent.imageNumber,
                        imageURL: sent.imageURL,
                        artist: sent.artist,
                        nsfw: sent.nsfw,
                        uploader: sent.uploader,
                        uploaderid: sent.uploaderid
                    })
                    
                    const sender = await database.Player.findOne({where: {id: sent.uploaderid}}); 
                    await sender.increment({ gems: 25*(sent.bonus+1), karma: (sent.bonus+1)});
                    await checker.increment({ gems: 25, karma: 1});
                    
                    const char = await database.Character.findOne({
                        where: {
                            characterID: sent.characterID
                        }
                    });

                    await char.increment({imageCount: 1});
                    const series = await database.Series.findOne({ where: { seriesID: char.seriesID}});
                    const channel = await interaction.guild.channels.cache.get('949952119052578877');
		            await channel.send(`${image.imageID}| ${char.characterName} from ${series.seriesName}\nArt by ${sent.artist} and uploaded by ${sent.uploader}`)
                    await channel.send(`${interaction.user.username} awarded ${25*(sent.bonus+1)}gems and ${sent.bonus+1}karma to uploader. There will be some delays in reward.`)
                    await channel.send(`${sent.imageURL}`);
                    
                    await database.Sendqueue.destroy({
                        where: {imageID: sent.imageID}
                    });
                    //send the images to main database
                    //send rewards to the uploader
                    await cvoteID(embed, interaction, queue);
                    break;
                
                case 'decline' :
                    const chard = await database.Character.findOne({
                        where: {
                            characterID: sent.characterID
                        }
                    });
                    if (!chard) {
                        await database.Sendqueue.destroy({
                            where: {imageID: sent.imageID}
                        });
                        await i.deferUpdate();
                        await cvoteID(embed, interaction, queue);
                    }
                    const seriesd = await database.Series.findOne({ where: { seriesID: chard.seriesID}});
                    const declinech = await interaction.guild.channels.cache.get('954395878016299108');
		            await declinech.send(`${sent.imageID}| ${chard.characterName} from ${seriesd.seriesName}\nArt by ${sent.artist} and uploaded by ${sent.uploader}`);
                    await declinech.send(`${sent.imageURL}`);
                    await checker.increment({ gems: 25, karma: 1});
                    await database.Sendqueue.destroy({
                        where: {imageID: sent.imageID}
                    });
                    //remove the images from queue
                    await i.deferUpdate();
                    await cvoteID(embed, interaction, queue);
                    break;
                
                case 'addbonus':
                    await sent.increment({bonus: 1})
                    //increment bonus and redisplay card.
                    await cvoteID(embed, interaction, queue);
                    break;

                case 'removebonus':
                    await sent.increment({bonus: -1})
                    //decrement bonus and redisplay card
                    await cvoteID(embed, interaction, queue);
                    break;

                case 'next':
                    const count = await database.Sendqueue.count();
                    if (queue+1 < count) {
                        await cvoteID(embed, interaction, queue+1)
                    } else {
                        await cvoteID(embed, interaction, 0)
                    }
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
		.setName('iscreen')
		.setDescription('Command for image mod to screen images.'),
	async execute(interaction) { 
        try {
            if (!interaction.member.roles.cache.has('951960776380416000')) {
                return interaction.reply("You don't have the image mod role!", {ephemeral: true});
            };
            const uid = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: uid}});
            if (player) {
                await start(interaction);
            } else {
                await interaction.reply("You are not a registered player. Use /isekai to get started.")
            }
            
        } catch(error) {
            await interaction.reply("Error has occured while performing the command.")
        }        
    }
}