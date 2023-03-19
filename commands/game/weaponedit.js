const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');


async function embedNew(interaction) {
    const embedNew = new MessageEmbed();
    embedNew.setTitle("Character Created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character is being created.`)
        .setColor(color.purple)
    return embedNew;
};

async function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor(color.failred);
    return embedError;asd
};
async function embedDupe(interaction) {
    const embedDupe = new MessageEmbed();
    embedDupe.setTitle("Character with same name Exists")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character with same name exists, make sure they are not same 
        Character and edit either Character name to allow coexistence`)
        .setColor("#ff0000");
    return embedDupe;
};

async function embedProcess(interaction) {
    const embedProcess = new MessageEmbed();
    const cid = await interaction.options.getInteger("id")
    embedProcess.setTitle(`Character ${cid} is being edited`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Processing...`)
        .setColor(color.purple)
    return embedProcess;
};

async function embedSuccess(interaction) {
    const embedSuccess = new MessageEmbed();
    const cid = await interaction.options.getInteger("id")
    const char = await database.Character.findOne({where: {characterID: cid}});
    embedSuccess.setTitle(`Character ${cid} edited`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Character ${char.characterName} has been edited`)
        .setColor(color.successgreen)
    return embedSuccess;
};

async function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor(color.failred);
    return embedError;
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

async function viewWeapon(interaction, weapon) {
    const embed = new MessageEmbed();
    const rarityText = await convertRarity(weapon.rarity);
    embed.setTitle(`${weapon.name}`)
    .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`${weapon.weaponFluff}`)
        .setColor(color.successgreen)
        .setThumbnail(`${weapon.weaponSprite}`)
        .setFields({name: "Weapon Details",
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
**Critical Damage: ** ${weapon.crd}`})
    return interaction.editReply({embeds: [embed]});
}

async function newWeapon(interaction) {
    const name = interaction.options.getString('name');
    const fluff = interaction.options.getString('fluff');
    const spriteurl = interaction.options.getString('spriteurl');
    const rarity = interaction.options.getInteger('rarity');
    const classtype = interaction.options.getString('class');
    const init = interaction.options.getInteger('init');
    const health = interaction.options.getInteger('health');
    const armor = interaction.options.getInteger('armor');
    const atk = interaction.options.getInteger('atk');
    const eva = interaction.options.getInteger('eva');
    const acc = interaction.options.getInteger('acc');
    const crt = interaction.options.getInteger('crt');
    const crd = interaction.options.getInteger('crd');
    const weapon = await database.Weapon.create({
        weaponSprite: spriteurl,
        name: name,
        weaponFluff: fluff,
        rarity: rarity,
        class: classtype,
        init: init,
        health: health,
        armor: armor,
        atk: atk,
        eva: eva,
        acc: acc,
        crt: crt,
        crd: crd,
    });
    return viewWeapon(interaction, weapon);
}

async function editWeapon(interaction) {
    const id = interaction.options.getInteger('id');
    const name = interaction.options.getString('name');
    const fluff = interaction.options.getString('fluff');
    const spriteurl = interaction.options.getString('spriteurl');
    const rarity = interaction.options.getInteger('rarity');
    const classtype = interaction.options.getString('class');
    const init = interaction.options.getInteger('init');
    const health = interaction.options.getInteger('health');
    const armor = interaction.options.getInteger('armor');
    const atk = interaction.options.getInteger('atk');
    const eva = interaction.options.getInteger('eva');
    const acc = interaction.options.getInteger('acc');
    const crt = interaction.options.getInteger('crt');
    const crd = interaction.options.getInteger('crd');
    const weapon = await database.Weapon.findOne({where: {weaponID: id}});
    if(name) {
        weapon.update({name: name});
    }
    if(fluff) {
        weapon.update({weaponFluff: fluff});
    }
    if(spriteurl) {
        weapon.update({weaponSprite: spriteurl});
    }
    if(rarity) {
        weapon.update({rarity: rarity});
    }
    if(classtype) {
        weapon.update({class: classtype});
    }
    if(init) {
        weapon.update({init: init});
    }
    if(health) {
        weapon.update({health: health});
    }
    if(armor) {
        weapon.update({armor: armor});
    }
    if(atk) {
        weapon.update({atk: atk});
    }
    if(eva) {
        weapon.update({eva: eva});
    }
    if(acc) {
        weapon.update({acc: acc});
    }
    if(crt) {
        weapon.update({crt: crt});
    }
    if(crd) {
        weapon.update({crd: crd});
    }
    return viewWeapon(interaction, weapon);
}



async function selectOption(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "new":
            return newWeapon(interaction);

        case "edit":
            return editWeapon(interaction);

        default:
            return editWeapon(interaction);
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('wcreatedit')
		.setDescription('Creates a new weapon')
        .addSubcommand(subcommand => subcommand
            .setName("new")
            .setDescription("Create a new waepon")
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the weapon")
                .setRequired(true))
            .addStringOption(option => option
                .setName("spriteurl")
                .setDescription("The name of the weapon")
                .setRequired(true))
            .addStringOption(option => option
                .setName("fluff")
                .setDescription("The fluff for the weapon")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("rarity")
                .setDescription("The rarity of the weapon")
                .setRequired(true))
            .addStringOption(option => option
                .setName("class")
                .setDescription("The class of the weapon")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("init")
                .setDescription("Weapon Initiative")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("health")
                .setDescription("Weapon health")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("armor")
                .setDescription("Weapon armor")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("atk")
                .setDescription("Weapon Attack")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("eva")
                .setDescription("Weapon Evasion")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("acc")
                .setDescription("Weapon Accuracy")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("crt")
                .setDescription("Weapon Critchance")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("crd")
                .setDescription("Weapon Critdamage")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("edit")
            .setDescription("Edit existing weapon.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the character")
                .setRequired(true))
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the weapon")
                .setRequired(false))
            .addStringOption(option => option
                .setName("spriteurl")
                .setDescription("The name of the weapon")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("rarity")
                .setDescription("The rarity of the weapon")
                .setRequired(false))
            .addStringOption(option => option
                .setName("class")
                .setDescription("The class of the weapon")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("init")
                .setDescription("Weapon Initiative")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("health")
                .setDescription("Weapon health")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("armor")
                .setDescription("Weapon armor")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("atk")
                .setDescription("Weapon Attack")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("eva")
                .setDescription("Weapon Evasion")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("acc")
                .setDescription("Weapon Accuracy")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("crt")
                .setDescription("Weapon Critchance")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("crd")
                .setDescription("Weapon Critdamage")
                .setRequired(false))),
	async execute(interaction) {
        const embedN = await embedNew(interaction);
        const embedD = await embedDupe(interaction);
        const embedE = await embedError(interaction);
        
        try {
            await interaction.reply({ embeds: [embedN] });
            if (!interaction.member.roles.cache.has('1086819458800177213')) {
                embedE.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the blacksmith role!");
                return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});
            };
            if (interaction.channel.id === '1086674842893438976') {
                return selectOption(interaction);
            } else {
                interaction.channel.send("Please use #series and characters channel for this command.")
            }
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedD] });
            }
            return interaction.editReply({ embeds: [embedE] });
        }
        console.log("there are no errors here.")
	},
};
