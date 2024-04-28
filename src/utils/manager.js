const { EmbedBuilder, ButtonInteraction, TimestampStyles, MessageComponentInteraction, InteractionType, Embed, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, UserContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const config = require("../config/config");

module.exports = class Manager {

    static help(client, message, guild, user, channel, cmds) {
        const categories = cmds.split(" | ");
    
        let currentPage = 0; // Keep track of the current page
    
        const helpEmbed = new EmbedBuilder()
            .setTitle("Help menu")
            .setColor(client.config.customization.embedColor)
            .setDescription(`*<@${user.id}> here is some information about my commands!*\n\n${categories[0]}`)
    
        const prevButton = new ButtonBuilder()
            .setCustomId('prevPage')
            //.setLabel('')
            .setEmoji({
                name: 'tts_left_arrow',
                id: '1194338492772270152',
           })
            .setStyle(ButtonStyle.Primary);
    
        const currentPageButton = new ButtonBuilder()
            .setCustomId('currentPage')
            .setLabel(`Page ${currentPage + 1}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
    
        const nextButton = new ButtonBuilder()
            .setCustomId('nextPage')
            //.setLabel('')
            .setEmoji({
                name: 'tts_right_arrow',
                id: '1194338413441191976',
           })
            .setStyle(ButtonStyle.Primary);
    
        const row = new ActionRowBuilder()
            .addComponents(prevButton, currentPageButton, nextButton);

        let isStaff, isRHelper; 
        /**const staffRole = guild.roles.cache.get(config.ranks.staff);
        if (staffRole && staffRole.members && staffRole.members.size > 0) {
            // Check if moderator is a member of the staff role
            isStaff = staffRole.members.some(member => member.user.id === moderator.id);
        } else {
            // Handle the case where the role or its members are not found
            console.error("Staff role or its members not found.");
            isStaff = false;
        }*/
        message.reply({ embeds: [helpEmbed], components: [row] })
        .then((msg) => {
            const filter = (interaction) => {
                return interaction.isButton() && interaction.message.id === msg.id && interaction.user.id === user.id;
            };
    
            const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
    
            collector.on('collect', (interaction) => {
                let canAdvance = true;
                let initialPage = currentPage;

                while (true) {
                    if (interaction.customId === 'prevPage') {
                        currentPage = (currentPage - 1 + categories.length) % categories.length;
                    } else if (interaction.customId === 'nextPage') {
                        currentPage = (currentPage + 1) % categories.length;
                    }                       
                    const pagecat = categories[currentPage].trim().split(" ");
                    const pagename = pagecat[0].replace(/\*/g, '');
                    canAdvance = false

                    if (pagename === "Moderation" || pagename === "Privateserver") {
                        if (isStaff) {
                            canAdvance = true;
                        }
                    } else {
                        canAdvance = true;
                    }
            
                    if (canAdvance) {
                        break;
                    } else if (currentPage === initialPage) {
                        break;
                    }
                }
                currentPageButton.setLabel(`Page ${currentPage + 1}`);
                helpEmbed.setDescription(`*<@${user.id}> here is some information about my commands!*\n\n${categories[currentPage]}`);
                interaction.update({ embeds: [helpEmbed], components: [row] });
            });
    
            collector.on('end', () => {
                row.components.forEach((component) => {
                    component.setDisabled(true);
                });
                msg.edit({ components: [row] });
            });
        });
    }

    static coinflip (client, channel, activation, guild, interaction) {
        const tailsGif = 'https://media.discordapp.net/attachments/1046821788987969589/1194306530292539422/VEOgKoT634.gif?ex=65afdfa1&is=659d6aa1&hm=7c35e235af4a7ecef1491233774c53d8fde34c8b01942ca1c8ec3f545c262677&=&width=223&height=223';
        const headsPng = 'https://media.discordapp.net/attachments/1046821788987969589/1194306531395653684/I3zM2Xx9N5.png?ex=65afdfa2&is=659d6aa2&hm=72b097586e7525803db06e5f3aa0c7752fe19d49bca349fc0cddc84fcb6a9d49&=&format=webp&quality=lossless&width=223&height=223';
        const headsGif = 'https://media.discordapp.net/attachments/1046821788987969589/1194306529650802708/zNwHqOtzgo.gif?ex=65afdfa1&is=659d6aa1&hm=ffb525a696384dd8abb75a72f79c2b88fe2bc7a092d31c799a664454053b1ea0&=&width=223&height=223';
        const tailsPng = 'https://media.discordapp.net/attachments/1046821788987969589/1194306531051700284/VlPLt3LsJt.png?ex=65afdfa2&is=659d6aa2&hm=a05d5915a25cc0d03a595059ac513aa0bb7a80cc7318bb0c28f16a2a1cdb7666&=&format=webp&quality=lossless&width=223&height=223';
        const model = 'RACM Public Commands';
        let curGif, curPng;
        let headsOrtails = Math.random();
        if (headsOrtails < .5) {
            curGif = tailsGif
            curPng = tailsPng
        } else if (headsOrtails >= .5) {
            curGif = headsGif
            curPng = headsPng
        }
        const coinflip = new EmbedBuilder()
        .setTitle("**Flipping the coin...**")
        .setAuthor({name: model, iconURL: guild.iconURL({ format: 'png', size: 2048 })})
        .setColor(client.config.customization.embedColor)
        .setDescription(`▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
        .setImage(curGif)
        if (!interaction) {
            channel.send({ embeds: [coinflip] })
            .then((msg) => {      
                if (headsOrtails < .5) {
                    coinflip.setTitle('The coin landed on Tails!')
                    coinflip.setImage(tailsPng)
                } else {
                    coinflip.setTitle('The coin landed on Heads!')
                    coinflip.setImage(headsPng)
                }
                setTimeout(() => {
                    console.log(msg)
                    msg.edit({ embeds: [coinflip] });
            }, 3500);
            })
        } else {
            interaction.reply({ embeds: [coinflip] })
            .then((msg) => {      
                if (headsOrtails < .5) {
                    coinflip.setTitle('The coin landed on Tails!')
                    coinflip.setImage(tailsPng)
                } else {
                    coinflip.setTitle('The coin landed on Heads!')
                    coinflip.setImage(headsPng)
                }
                setTimeout(() => {
                    msg.edit({ embeds: [coinflip] });
                }, 3500);
            })
        }
    }
   
    static userinfo (client, channel, user, guild, target, interaction) {      
        let status, device;
        const targetid = target.user.id
        const avatarid = target.user.avatar
        if (target.presence && target.presence.status) {
            if (target.presence.status && target.presence.clientStatus.mobile) {
                device = "Mobile"
            } else if (target.presence.status && target.presence.clientStatus.desktop) {
                device = "Desktop"
            }
            if (target.presence.status === "online") {
                status = `<:online_status:1194344377682772130> User is online`;
            } else if (target.presence.status === "dnd") {
                status = `<:dnd_status:1194344442870648893> User is on DND`;
            } else if (target.presence.status === "idle") {
                status = `<:idle_status:1194344399635742740> User is idling`;
            } else {
                status = `<:offline_status:1194344422058500126> User is offline`;
            }
        } else {
            status = `<:offline_status:1194344422058500126> User is offline`;
        }
        if (device) {
           status = `${status} on ${device}`
        }

        const djoined = target.user.createdTimestamp
        const sjoined = target.joinedTimestamp
        let notes = "";
        /** Change into checking ids - STEF
         * 
         * const hexastaffrole = guild.roles.cache.get("1199389304275873832").members;
        if (hexastaffrole.some(member => member.user.id === target.user.id) === true) {
            notes = `${notes}\n<:staff:1233078724300242947> This user is Hexalon staff`
        } */
        if (target.user.id === guild.ownerId) {
            notes = `${notes}\n👑 This user owns this server`
        }
        if (target.user.id === config.main.owner) {
            notes = `${notes}\n<a:pepe_hacker:1194367226279645196> This user is a Hexalon developer`
        } 
        if (target.user.bot === true) {
            notes = `${notes}\n<:Developer:1194366936763613195> This user is a bot`
        }
        const infoEmbed = new EmbedBuilder()
            .setAuthor({name: target.user.username, iconURL: `https://cdn.discordapp.com/avatars/${targetid}/${avatarid}.webp?format=webp&width=638&height=638`})
            .setColor(client.config.customization.embedColor)
            .setDescription(`**Mention:** <@${target.user.id}>\n**Display name:** ${target.user.globalName}\n**Notes:** ${notes}\n**`)
            .addFields(
                {name: "Information", value: `Joined discord at <t:${Math.floor(djoined / 1000)}:f>`, inline: false},
                {name: `Roles ${target.roles.length}`, value: `Joined R&CM at <t:${Math.floor(sjoined / 1000)}:f>`, inline: false},
                {name: "Status", value: `${status}`, inline: false},
                )
            .setFooter({text: `${client.config.branding.name}`, iconURL: `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.webp?format=webp&width=638&height=638`})
            .setThumbnail(`https://cdn.discordapp.com/avatars/${targetid}/${avatarid}.webp?format=webp&width=638&height=638`)
        if (!interaction) {
            channel.send({ embeds: [infoEmbed] });
        } else {
            interaction.reply({ embeds: [infoEmbed] });
        }
    }

}