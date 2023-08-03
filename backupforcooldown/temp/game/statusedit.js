const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');


async function embedNew(interaction) {
    const embedNew = new MessageEmbed();
    embedNew.setTitle("Status Created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Status has been created or deleted.`)
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

async function viewStatus(interaction, statusType) {
    const embed = new MessageEmbed();
    embed.setTitle(`${statusType.name}`)
        .setDescription(`${statusType.description}`)
        .setColor(color.successgreen)
    if(statusType.statusSprite) {
        embed.setAuthor({name: `${interaction.user.username}`, iconURL: statusType.statusSprite});
    }
    return await interaction.editReply({embeds: [embed]});
}

async function newStatus(interaction) {
    const name = interaction.options.getString('name');
    const statusSprite = interaction.options.getString('statussprite');
    const description = interaction.options.getString('description');
    const status = await database.StatusType.create({
        name: name,
        statusSprite: statusSprite,
        description: description,
    });
    return viewStatus(interaction, status);
}

async function editStatus(interaction) {
    const id = interaction.options.getInteger('id');
    const name = interaction.options.getString('name');
    const statusSprite = interaction.options.getString('statussprite');
    const description = interaction.options.getString('description');
    const status = await database.StatusType.findOne({where: {id: id}});
    if(name) {
        status.update({name: name});
    }
    if(statusSprite) {
        status.update({statusSprite: statusSprite});
    }
    if(description) {
        status.update({description: description});
    }
    return viewStatus(interaction, status);
}

async function removeStatus(interaction) {
    const id = interaction.options.getInteger('id');
    return await database.StatusType.destroy({where: {id: id}});
}


async function selectOption(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "new":
            return newStatus(interaction);

        case "edit":
            return editStatus(interaction);

        case "remove":
            return removeStatus(interaction);

        default:
            break;
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('sfx')
		.setDescription('Creates a new status effect')
        .addSubcommand(subcommand => subcommand
            .setName("new")
            .setDescription("Create a new status")
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the status")
                .setRequired(true))
            .addStringOption(option => option
                .setName("description")
                .setDescription("The fluff for the status")
                .setRequired(true))
            .addStringOption(option => option
                .setName("statussprite")
                .setDescription("The name of the status")
                .setRequired(false)))
        .addSubcommand(subcommand =>subcommand
            .setName("edit")
            .setDescription("Edit existing status.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the status")
                .setRequired(true))
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the status")
                .setRequired(false))
            .addStringOption(option => option
                .setName("statussprite")
                .setDescription("The name of the status")
                .setRequired(false))
            .addStringOption(option => option
                .setName("description")
                .setDescription("The fluff for the status")
                .setRequired(false)))
        .addSubcommand(subcommand =>subcommand
            .setName("remove")
            .setDescription("removes existing status.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the status")
                .setRequired(true))),
	async execute(interaction) {
        const embedN = await embedNew(interaction);
        const embedD = await embedDupe(interaction);
        const embedE = await embedError(interaction);
        
        try {
            await interaction.reply({ embeds: [embedN] });
            if (!interaction.member.roles.cache.has('908920341588496445')) {
                embedE.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the wizard role!");
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
