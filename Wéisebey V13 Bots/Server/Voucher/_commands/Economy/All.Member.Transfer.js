const { Client, Message, MessageButton, MessageActionRow } = require("discord.js");
const Users = require('../../../../Global/Databases/Schemas/Client.Users');
const { genEmbed } = require("../../../../Global/Init/Embed");
module.exports = {
  Isim: "transferler",
  Komut: ["transferlerim"],
  Kullanim: "transferler <@weise/ID>",
  Aciklama: "Belirlenen veya komutu kullanan kişi belirlediği taglı sayısını ve en son belirlediği taglı sayısını gösterir.",
  Kategori: "eco",
  Extend: true,
    
   /**
   * @param {Client} client 
   */
  onLoad: function (client) {

  },

   /**
   * @param {Client} client 
   * @param {Message} message 
   * @param {Array<String>} args 
   */

  onRequest: async function (client, message, args) {
    let uye = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.member;
    if(!uye) return message.reply(cevaplar.üye).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    uye = message.guild.members.cache.get(uye.id)
    const button1 = new MessageButton()
                .setCustomId('geri')
                .setLabel('◀ Geri')
                .setStyle('PRIMARY');
    const buttonkapat = new MessageButton()
                .setCustomId('kapat')
 .setEmoji("929001437466357800")               
 .setStyle('DANGER');
                
    const button2 = new MessageButton()
                .setCustomId('ileri')
                .setLabel('İleri ▶')
                .setStyle('PRIMARY');
    Users.findOne({_id: uye.id }, async (err, res) => {
      if (!res) return message.channel.send({embeds: [new genEmbed().setAuthor(uye.user.tag, uye.user.avatarURL({dynamic: true})).setDescription(`${uye} isimli üyenin transfer bilgisi bulunamadı.`)]}).then(x => setTimeout(() => {x.delete()}, 7500))
      if(!res.Transfers) return message.channel.send({embeds: [new genEmbed().setAuthor(uye.user.tag, uye.user.avatarURL({dynamic: true})).setDescription(`${uye} isimli üyenin transfer bilgisi bulunamadı.`)]}).then(x => setTimeout(() => {x.delete()}, 7500))
      let pages = res.Transfers.sort((a, b) => b.Tarih - a.Tarih).chunk(20);
      var currentPage = 1
      if (!pages && !pages.length || !pages[currentPage - 1]) return message.channel.send({embeds: [new genEmbed().setAuthor(uye.user.tag, uye.user.avatarURL({dynamic: true})).setDescription(`${uye} isimli üyenin taglı bilgisi bulunamadı.`)]}).then(x => setTimeout(() => {x.delete()}, 7500))
      let embed = new genEmbed().setColor("WHITE").setAuthor(uye.user.tag, uye.user.avatarURL({dynamic: true})).setFooter(`${ayarlar.serverName ? ayarlar.serverName : message.guild.name} • ${currentPage} / ${pages.length}`, message.guild.iconURL({dynamic: true}))
      const row = new MessageActionRow().addComponents([button1, buttonkapat, button2]);
      if (message.deferred == false){
        await message.deferReply()
      };
      const curPage = await message.channel.send({
        embeds: [embed.setDescription(`${uye}, üyesin transfer bilgisi yükleniyor... Lütfen bekleyin...`)],
        components: [row], fetchReply: true,
      }).catch(err => {});
    
      await curPage.edit({embeds: [embed.setDescription(`${uye} isimli üyesinin toplamda \`${res.Transfers.length || 0}\` adet transferi mevcut.

${pages[currentPage - 1].map((value, index) => `\` ${index + 1} \` ${message.guild.members.cache.get(value.Uye) ? message.guild.members.cache.get(value.Uye) : `<@${value.Uye}>`} \`${value.Tutar} ${value.Islem}\` (\`${tarihsel(value.Tarih)}\`)`).join("\n")} `)]}).catch(err => {})

      const filter = (i) => i.user.id == message.member.id

      const collector = await curPage.createMessageComponentCollector({
        filter,
        time: 30000,
      });

      collector.on("collect", async (i) => {
        switch (i.customId) {
          case "ileri":
            if (currentPage == pages.length) break;
            currentPage++;
            break;
          case "geri":
            if (currentPage == 1) break;
            currentPage--;
            break;
          default:
            break;
          case "kapat": 
            i.deferUpdate().catch(err => {});
            curPage.delete().catch(err => {})
            return message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined);
        }
        await i.deferUpdate();
        await curPage.edit({
          embeds: [embed.setFooter(`${ayarlar.serverName ? ayarlar.serverName : message.guild.name} • ${currentPage} / ${pages.length} `, message.guild.iconURL({dynamic: true})).setDescription(`${uye} isimli üyesinin toplamda \`${res.Transfers.length || 0}\` adet transferi mevcut.

${pages[currentPage - 1].map((value, index) => `\` ${index + 1} \` ${message.guild.members.cache.get(value.Uye) ? message.guild.members.cache.get(value.Uye) : `<@${value.Uye}>`} \`${value.Tutar} ${value.Islem}\` (\`${tarihsel(value.Tarih)}\`)`).join("\n")}`)]
        }).catch(err => {});
        collector.resetTimer();
      });
      collector.on("end", () => {
        if(curPage) curPage.edit({
          embeds: [embed.setFooter(`${ayarlar.serverName ? ayarlar.serverName : message.guild.name}`, message.guild.iconURL({dynamic: true})).setDescription(`${uye} isimli üyesinin toplamda \`${res.Transfers.length || 0}\` adet transferi mevcut.`)],
          components: [],
        }).catch(err => {});
      })
    })
  }
};

