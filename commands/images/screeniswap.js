const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');

async function start(interaction) {
    const user = interaction.user.id;
    const embed = await createEmbed(interaction);
    await interaction.reply({embeds: [embed]});
    await iswapID(embed, interaction, 0);
}

function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Starting image swap screen")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Starting")
        .setColor(color.failred);
    return embed;
}

async function iswapID(embed, interaction, queue) {
    try {
        console.log("1");
        const sent = await database.Swapimage.findOne({
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
            const series = await database.Series.findOne({ where: { seriesID: char.seriesID}});
            console.log("5");
        const total = sent.yes + sent.no + sent.another + sent.abstain;
        await embed.setDescription(`
Image ID: ${sent.imageID}
Character ID: ${sent.characterID}
Character Alias: ${char.alias}
Series: ${char.seriesID} | ${series.seriesName}
Image Number: ${sent.imageNumber}
Uploader: ${sent.uploader}
Artist: ${sent.artist}
Small Edit: ${sent.selfcrop}
Yes: ${sent.yes}
No: ${sent.no}
Another: ${sent.another}
Abstain: ${sent.abstain}
Total: ${total}

Bonus: ${sent.bonus} (25gems&1karma/bonus)`).setTitle(`${char.characterName}`)
            .setColor(color.successgreen)
            .setImage(sent.previewURL);
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
        console.log("error has occured in iswapID.");
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

async function moveImage (queue) {
    const sent = await database.Swapimage.findOne({
        order: [['imageID','ASC']],
        offset: queue
    });
    const imageCount = await database.Image.count({where: {characterID: sent.characterID}});
    const inumber = sent.imageNumber;
    await database.Image.update(
        {imageNumber: imageCount+1},
        {where: {characterID: sent.characterID, imageNumber: sent.imageNumber}}
    );
}


async function buttonManager(embed, interaction, msg, queue) {
    try {
        const checker = await database.Player.findOne({where: {playerID: interaction.user.id}});
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });

        const sent = await database.Swapimage.findOne({
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
                    const char = await database.Character.findOne({
                        where: {
                            characterID: sent.characterID
                        }
                    });
                    if (sent.selfcrop == false) {
                        await moveImage(queue);
                        const image = await database.Image.create({
                            characterID: sent.characterID,
                            imageNumber: sent.imageNumber,
                            imageURL: sent.imageURL,
                            artist: sent.artist,
                            nsfw: sent.nsfw,
                            uploader: sent.uploader,
                            uploaderid: sent.uploaderid
                        })
                        const series = await database.Series.findOne({ where: { seriesID: char.seriesID}});
                        const channel = await interaction.guild.channels.cache.get('949952119052578877');
                        await channel.send(`${image.imageID}| ${char.characterName} from ${series.seriesName}\nArt by ${sent.artist} and uploaded by ${sent.uploader}`)
                        await channel.send(`${interaction.user.username} awarded ${50*(sent.bonus+1)}gems, ${sent.bonus+1}karma and 3xp to uploader.`)
                        await channel.send(`${sent.imageURL}`);
                        await char.increment({imageCount: 1});
                    } else {
                        const image = await database.Image.findOne({where: {characterID: sent.characterID, imageNumber: sent.imageNumber}});
                        await image.update({imageURL: sent.imageURL});

                        const series = await database.Series.findOne({ where: { seriesID: char.seriesID}});
                        const channel = await interaction.guild.channels.cache.get('949952119052578877');
                        await channel.send(`${image.imageID}| ${char.characterName} from ${series.seriesName}\nArt by ${sent.artist} and edited by ${sent.uploader}`)
                        await channel.send(`${interaction.user.username} awarded ${50*(sent.bonus+1)}gems, ${sent.bonus+1}karma and 3xp to uploader.`)
                        await channel.send(`${sent.imageURL}`);
                    }
                    
                    const sender = await database.Player.findOne({where: {id: sent.uploaderid}}); 
                    await sender.increment({ gems: 50*(sent.bonus+1), karma: (sent.bonus+1), xp: 3, imagePrestige: 1});
                    await checker.increment({ gems: 50, karma: 1});
                    
                    

                    
                    
                    
                    
                    await database.Swapimage.destroy({
                        where: {imageID: sent.imageID}
                    });
                    //send the images to main database
                    //send rewards to the uploader
                    await iswapID(embed, interaction, queue);
                    break;
                
                case 'decline' :
                    const chard = await database.Character.findOne({
                        where: {
                            characterID: sent.characterID
                        }
                    });
                    const seriesd = await database.Series.findOne({ where: { seriesID: chard.seriesID}});
                    const declinech = await interaction.guild.channels.cache.get('954395878016299108');
		            await declinech.send(`${sent.imageID}| ${chard.characterName} from ${seriesd.seriesName}\nArt by ${sent.artist} and uploaded by ${sent.uploader}`);
                    await declinech.send(`${sent.imageURL}`);
                    await checker.increment({ gems: 25, karma: 1});
                    await database.Swapimage.destroy({
                        where: {imageID: sent.imageID}
                    });
                    //remove the images from queue
                    await i.deferUpdate();
                    await iswapID(embed, interaction, queue);
                    break;
                
                case 'addbonus':
                    await sent.increment({bonus: 1})
                    //increment bonus and redisplay card.
                    await iswapID(embed, interaction, queue);
                    break;

                case 'removebonus':
                    await sent.increment({bonus: -1})
                    //decrement bonus and redisplay card
                    await iswapID(embed, interaction, queue);
                    break;

                case 'next':
                    const count = await database.Swapimage.count();
                    if (queue+1 < count) {
                        await iswapID(embed, interaction, queue+1)
                    } else {
                        await iswapID(embed, interaction, 0)
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
		.setName('isscreen')
		.setDescription('Command for image mod to screen images.'),
	async execute(interaction) { 
        try {
            // if (!interaction.member.roles.cache.has('951960776380416000')) {
            //     return interaction.reply("You don't have the image mod role!", {ephemeral: true});
            // };
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