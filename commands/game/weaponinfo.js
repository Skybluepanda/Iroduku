const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()


async function createEmbed(interaction) {
    const embedNew = new MessageEmbed();
    embedNew.setTitle("Weapon Info")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Displaying Weapon Info.`)
        .setColor(color.purple)
    return embedNew;
};

async function convertRarity(rarity) {
    switch (rarity) {
        case 1:
            return "Rare";
        case 2:
            return "Epic";
        case 3:
            return "Legendary";
    }
}


async function viewWeapon(interaction) {
    console.log(6);
    const embed = new MessageEmbed();
    const wname = await interaction.options.getString("name");
    const weapon = await database.Weapon.findOne({where: { name: {[Op.like]: '%' + wname + '%'}}});
    const rarityText = await convertRarity(weapon.rarity);
    console.log(7);
    await embed.setTitle(`${weapon.name}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`${weapon.weaponFluff}`)
        .setColor(color.successgreen)
        .setThumbnail(`${weapon.weaponSprite}`)
        .addFields({name: "Weapon Details",
            value:
`**Rarity: ** ${rarityText}
**Class: ** ${weapon.class}
**Initiative: ** ${weapon.init}
**Health: ** ${weapon.health}
**Armor: ** ${weapon.armor}
**Attack: ** ${weapon.atk}
**Accuracy: ** ${weapon.acc}
**Evasion: ** ${weapon.eva}
**Critical Chance: ** ${weapon.crt}
**Critical Damage: ** ${weapon.crd}`
    });
    console.log(8);
    const ability0 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 0}});
    const ability1 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 1}});
    const ability2 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 2}});
    const ability3 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 3}});
    console.log(9);
    if(ability0) {
        embed.addFields({name: `${ability0.abilityName}`, value: `${ability0.abilityText}`})
    }
    if(ability1) {
        embed.addFields({name: `${ability1.abilityName}`, value: `${ability1.abilityText}`})
    }
    if(ability2) {
        embed.addFields({name: `${ability2.abilityName}`, value: `${ability2.abilityText}`})
    }
    if(ability3) {
        embed.addFields({name: `${ability3.abilityName}`, value: `${ability3.abilityText}`})
    }
    console.log(10);
    return interaction.reply({embeds: [embed]});
}

async function viewWeaponId(interaction) {
    const embed = new MessageEmbed();
    console.log(1);
    const weaponid = await interaction.options.getInteger('weaponid');
    console.log(`${weaponid}`);
    console.log(2);
    const weapon = await database.Weapon.findOne({where: {id: weaponid}});
    console.log(3);
    const rarityText = await convertRarity(weapon.rarity);
    console.log(4);
    await embed.setTitle(`${weapon.name}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`${weapon.weaponFluff}`)
        .setColor(color.successgreen)
        .setThumbnail(`${weapon.weaponSprite}`)
        .addFields({name: "Weapon Details",
            value:
`**Rarity: ** ${rarityText}
**Class: ** ${weapon.class}
**Initiative: ** ${weapon.init}
**Health: ** ${weapon.health}
**Armor: ** ${weapon.armor}
**Attack: ** ${weapon.atk}
**Evasion: ** ${weapon.eva}
**Accuracy: ** ${weapon.acc}
**Critical Chance: ** ${weapon.crt}
**Critical Damage: ** ${weapon.crd}`
    });
    const ability0 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 0}});
    const ability1 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 1}});
    const ability2 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 2}});
    const ability3 = await database.Ability.findOne({where: {weaponID: weapon.id, abilitySlot: 3}});
    if(ability0) {
        embed.addFields({name: `Passive: ${ability0.abilityName}`, value: `${ability0.abilityText}`});
    }
    if(ability1) {
        embed.addFields({name: `Attack: ${ability1.abilityName}`, value: `${ability1.abilityText}`});
    }
    if(ability2) {
        embed.addFields({name: `Primary: ${ability2.abilityName}`, value: `${ability2.abilityText}`});
    }
    if(ability3) {
        embed.addFields({name: `Secondary: ${ability3.abilityName}`, value: `${ability3.abilityText}`});
    }
    return interaction.reply({embeds: [embed]});
}



async function winfoName(embed, interaction) {
    try {
        console.log(1);
        const wname = await interaction.options.getString("name");
        if (wname.length < 3){
            console.log(2);
            return interaction.reply("Short names will yield a large list of characters. Use /clist command to find the id than try again with the cinfo id subcommand.");
        } else {
            console.log(3);
            const weaponCount = await database.Weapon.count({ 
                where: { name: {[Op.like]: '%' + wname + '%'},}
            })
            console.log(3.5);
            switch (weaponCount) {
                case 0:
                    await interaction.reply({embeds: [embed]});
                    break;
                
                case 1:
                    console.log(4);
                    return viewWeapon(interaction);

                default:
                    console.log(5);
                    await weaponList(interaction, embed);
                };
        } 
    } catch(error) {
        console.log("error has occured in winfoName");
    }
}

function joinBar(weapon){
    return [weapon.id, weapon.name].join("| ");
}

async function weaponList(interaction, embed){
    try {
        const wname = await interaction.options.getString("name");
        const list = await database.Weapon.findAll(
            {attributes: ['id', 'name'],
            order: ['id'],
            limit: 20,
            where: {
                name: {[Op.like]: '%' + wname + '%'},
            }}
        );
        const listString = await list.map(joinBar).join(`\n`);
        await embed
            .setTitle("Multiple weapons with the search name found.")
            .setDescription(`
            ${listString}
            If there are 20 listed weapons and you don't see yours, try /weaponlist!`)
            .setColor(color.aqua);
        return await interaction.reply({embeds: [embed]});
    } catch(error) {
        console.log("Error has occured with charList");
    }
}



async function subcommandProcess(embed, interaction) {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            await winfoName(embed, interaction);
            break;
        
        case "id":
            console.log("ID");
            await viewWeaponId(interaction);
            break;
            
        default:
            await interaction.reply("Please use the subcommands");
            break;
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('wi')
		.setDescription('Shows information of a weapon')
        .addSubcommand(subcommand =>
            subcommand
                .setName("name")
                .setDescription("Searches for a weapon with the name and displays info if they are unique.")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("The name you want find")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("id")
                .setDescription("Finds info of a weapon with id")
                .addIntegerOption(option => 
                    option
                        .setName("weaponid")
                        .setDescription("The id of the weapon")
                        .setRequired(true)
                        )),
	async execute(interaction) {
		const embed = await createEmbed(interaction);
        try {
            console.log('Wew')
            await subcommandProcess(embed, interaction);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}