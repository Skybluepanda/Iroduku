const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, IntegrationApplication } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()


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

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('accept')
                    .setLabel('accept')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('cancel')
                    .setStyle('DANGER')
            )
            // .addComponents(
            //     new MessageButton()
            //         .setCustomId('search')
            //         .setLabel('search')
            //         .setStyle('PRIMARY')
            // )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(interaction, msg) {
    console.log(4);
    try {
        console.log(5);
        const target = await interaction.options.getUser('targetuser');
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'accept':
                    await buttonManager2(interaction, msg);
                    console.log(6);
                    await interaction.channel.send(`${target.toString()} come get your gift from ${interaction.user.toString()}`)
                    break;
                
                case 'cancel':
                    console.log(7);
                    await interaction.channel.send("Gift Cancelled");
                    break;
            };
            
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function buttonManager2(interaction, msg) {
    console.log(8);
    try {   
        const target = await interaction.options.getUser('targetuser');
        const filter = i => i.user.id === target.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'accept':
                    console.log(9);
                    const uid = await interaction.user.id;
                    const lid = await interaction.options.getInteger('lid');
                    const slot = await inventorycheck(target.id);
                    await database.Card.update({playerID: target.id, inventoryID: slot}, {where: {playerID: uid, inventoryID: lid}});
                    console.log(10);
                    await interaction.channel.send(`Gift accepted. Card ${lid} added to ${target.toString()}'s as card ${slot}`);
                    console.log(11);
                    break;
                
                case 'cancel':
                    await interaction.channel.send("Gift Rejected");
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function viewWhiteCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let imgID = await card.imageID;
    let imgNumber = await card.imageNumber;
    let image;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if (imgID) {
        image = await database.Image.findOne({ where: { imageID: imgID}});
    } else if (imgNumber) {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: card.imageNumber}})
    } else {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: 1}})
    }

    //card is a card object
    //cid, inventory id, rarity , tag, image number, image id, quantity. createdAt.
    if (image) {
        embedCard.setImage(image.imageURL)
            .setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(image.imageURL)
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID: **${cid}
**Series: **${char.seriesID} | ${series.seriesName}
**Rarity: **Quartz
**Quantity:** ${card.quantity}`)
        .setColor(color.white);
    const row = await createButton();
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg);
}

async function viewGreenCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let imgID = await card.imageID;
    let imgNumber = await card.imageNumber;
    let image;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if (imgID) {
        image = await database.Image.findOne({ where: { imageID: imgID}});
    } else if (imgNumber) {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: card.imageNumber}})
    } else {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: 1}})
    }

    //card is a card object
    //cid, inventory id, rarity , tag, image number, image id, quantity. createdAt.
    if (image) {
        embedCard.setImage(image.imageURL)
            .setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
        Image ID is ${image.imageID} report any errors using ID.`)
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Jade
**Quantity:** ${card.quantity}`)
        .setColor(color.green);
    const row = await createButton();
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg);
}

async function viewBlueCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if (card.imageNumber > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: card.imageNumber}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        console.log(-(card.imageNumber));
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(card.imageNumber)}});
        if (image){
            url = await image.gifURL;
            embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Lapis
**Quantity:** ${card.quantity}`)
        .setColor(color.blue);
    
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg);
}

async function viewPurpleCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
            url = await image.gifURL;
            embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Amethyst
**Weapon: **${weaponName}
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.purple);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg);
}

async function viewRedCard(card, interaction) { 
    console.log(1);
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: **Ruby
**Weapon: **${weaponName}
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.red);
    const row = await createButton();
    console.log(2);
    
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    console.log(3);
    await buttonManager(interaction, msg);
}

async function viewDiaCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: **Diamond
**Weapon: **${weaponName}
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.diamond);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg);
}

async function viewPinkCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Pink Diamond**
**Weapon: **${weaponName}
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.pink);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg);
}

async function viewStelCard(card, interaction) { 
    const Azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const embedCard = new MessageEmbed();
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${Azur.artist}
*Upload your choice of image of the character using /stellarupload*`).setImage(Azur.imageURL)
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Stellarite**
**Weapon: **${weaponName}
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.stellar);
    const row = await createButton();
    if (Azur.season == 2) {
        await interaction.reply(`||${Azur.imageURL}||`)
        msg = await interaction.editReply({embeds: [embedCard], components: [row], fetchReply: true});
    } else {
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    }
    await buttonManager(interaction, msg);
}

async function viewSpeCard(card, interaction) { 
    const special = await database.Special.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cname = special.characterName;
    url = await image.imageURL;
    const weapon = card.weapon;
    let weaponName;
    if (weapon) {
        const weaponDB = await database.Weapon.findOne({where: {id:weapon}});
        weaponName = weaponDB.name;
    } else {
        weaponName = "Unawakened"
    }
    embedCard.setFooter(`Art by ${special.artist}
*edit card with /spedit*`).setImage(special.imageURL)
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID}
**Series:** ${special.seriesName}
**Rarity: Special**
**Weapon: **${weaponName}
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(special.color);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg);
}

async function switchRarity(card, rarity, interaction) {
    switch (rarity) {
        case 1:
            return viewWhiteCard(card, interaction);
            //white
        case 2:
            return viewGreenCard(card, interaction);
            //green
        case 3:
            return viewBlueCard(card, interaction);
            //Blue
        case 4:
            return viewPurpleCard(card, interaction);
            //Purple
        case 5:
            return viewRedCard(card, interaction);
        //red
        case 6:
            return viewDiaCard(card, interaction);

        case 7:
            return viewPinkCard(card, interaction);

        case 9:
            return interaction.reply("Stellarite cannot be gifted. use trade commands.");

        case 10:
            return viewSpeCard(card, interaction);
        default:
            return "error";
            //wtf?
    }
}

async function deckCheck(interaction) {
    const lid = await interaction.options.getInteger('lid');
    const card = await database.Card.findOne({where: {playerID: interaction.user.id, inventoryID: lid}});
    console.log('card', card);
    if(card && card.weapon) {
        const deck = await database.Deck.findOne({where: {
            playerID: interaction.user.id,
            [Op.or]: [
            { unit1: lid },
            { unit2: lid },
            { unit3: lid },
            { unit4: lid },
            { unit5: lid }
          ]}});
        console.log('deck', deck);
        if (deck) {
            return true;
        }
    }
    return false;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gift')
		.setDescription('gifts a card to a user.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The list id for the card you want to view")
                .setRequired(true)
                )
        .addUserOption(option => 
            option
                .setName("targetuser")
                .setDescription("The person you want to gift it to")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            const user = await interaction.user.id
            const lid = await interaction.options.getInteger('lid');
            const card = await database.Card.findOne({where: {playerID: user, inventoryID: lid}});
            const target = await interaction.options.getUser('targetuser');
            console.log(target);
            console.log(target.id);
            const targetplayer = await database.Player.findOne({where: {playerID: target.id}});
            if (card && targetplayer) {
                if(await deckCheck(interaction)) {
                    return interaction.reply("Can't gift awakened cards that is currently in a deck!");
                }
                await switchRarity(card, card.rarity, interaction);
            } else if (!card) {
                interaction.reply("Error Invalid list ID");
            } else if (!targetplayer) {
                interaction.reply("Invalid user");
            }
        } catch(error) {
            await  interaction.reply(`Error has occured while performing the command. ${error} `)
        }        
    }
}