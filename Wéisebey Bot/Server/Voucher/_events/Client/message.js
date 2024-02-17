const { Message, MessageEmbed } = require("discord.js");
const Users = require('../../../../Global/Databases/Schemas/Client.Users');
const GUILDS_SETTINGS = require('../../../../Global/Databases/Schemas/Global.Guild.Settings');
const Settings = require('../../../../Global/Databases/Schemas/Global.Guild.Settings');
const { genEmbed } = require("../../../../Global/Init/Embed");
const commandBlocks = require('../../../../Global/Databases/Schemas/Others/Users.Command.Blocks');
const ms = require('ms');
const spamCommandCount = new Map()
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

 /**
 * @param {Message} message 
 */

module.exports = async (message) => { 

    // Sync Data's
    let Data = await GUILDS_SETTINGS.findOne({ _id: 1 })
    ayarlar = client._settings = global.ayarlar = global._settings = kanallar = client._channels = global.kanallar = global.channels =  roller = client._roles = global.roller = global._roles = Data.Ayarlar
    
    const adapter = new FileSync("../../Global/Settings/_emojis.json")
    const db = low(adapter)
    emojiler = client._emojis = global.emojiler = global._emojis = db.value();
    cevaplar = client._reply = global.cevaplar = global._reply = require('../../../../Global/Settings/_reply');
    var reload = require('require-reload')(require);
    _statSystem = global._statSystem =  reload('../../../../Global/Plugins/Staff/Sources/_settings.js');
    // Sync Data's

    if (message.author.bot || !global.sistem.botSettings.Prefixs.some(x => message.content.startsWith(x)) || !message.channel || message.channel.type == "dm") return;
    let args = message.content.substring(global.sistem.botSettings.Prefixs.some(x => x.length)).split(" ");
    let komutcuklar = args[0].toLocaleLowerCase()
    let weise = message.client;
    args = args.splice(1);
    let calistirici;
    let TalentPerms;
    if(await Data.talentPerms) {

     TalentPerms = await Data.talentPerms.filter(x => !Array.isArray(x.Commands)).find(x => x.Commands == komutcuklar) || await Data.talentPerms.filter(x => Array.isArray(x.Commands)).find(x => x.Commands.some(kom => kom == komutcuklar))

    }
    if(ayarlar.type && [".tag", "!tag"].includes(message.content.toLowerCase())) { 
      if((!message.mentions.members.first() || !message.guild.members.cache.get(args[0]))) return ayarlar.tag ? message.reply(`${ayarlar.tag}`) : message.channel.send(`\`❌\` Bu sunucuya ait veritabanında tag ayarı bulunamadı. Lütfen tag belirleyiniz...`).then(x => {
      client.logger.log("Bu sunucuya ait veritabanında tag ayarı bulunamadı. Lütfen tag belirleyiniz...","error")
      setTimeout(() => {
          x.delete()
        }, 7500);
      }) 
    }

    const url = await message.guild.fetchVanityData();
    if(message.member.roles.cache.has(roller.jailRolü) || message.member.roles.cache.has(roller.şüpheliRolü) || message.member.roles.cache.has(roller.underworldRolü) || message.member.roles.cache.has(roller.yasaklıTagRolü) || (roller.kayıtsızRolleri && roller.kayıtsızRolleri.some(rol => message.member.roles.cache.has(rol)))) return;
    
    if(weise.commands.has(komutcuklar) || weise.aliases.has(komutcuklar) || TalentPerms) {
      if((kanallar.izinliKanallar && !kanallar.izinliKanallar.some(x => message.channel.id == x)) && !message.member.permissions.has("ADMINISTRATOR") && !ayarlar.staff.includes(message.member.id) && !["temizle","sil","booster","b","snipe","afk","kilit", "çekiliş"].some(x => komutcuklar == x) ) {
        return message.reply(`${cevaplar.prefix} Belirtilen komut bu kanalda kullanıma izin verilemiyor, lütfen ${message.guild.channels.cache.get(kanallar.izinliKanallar[0])} kanalında tekrar deneyin.`).then(x=> setTimeout(() => {
          x.delete().catch(err => {})
          message.delete().catch(err => {})
        }, 10000));;
      }
      if (!ayarlar.staff.includes(message.member.id) && !message.member.permissions.has('ADMINISTRATOR') && !roller.kurucuRolleri.some(x=> message.member.roles.cache.has(x))) {
        let cBlock = await commandBlocks.findOne({_id: message.member.id })
        if(cBlock) return;
        let spamDedection = spamCommandCount.get(message.author.id) || []
        let cmd = { lastContent: message.content, Channel: message.channel.id, Command: komutcuklar }
        spamDedection.push(cmd)
        spamCommandCount.set(message.author.id, spamDedection)
        if (spamDedection.length >= 15) {
          let kanalBul = message.guild.kanalBul("safe-command-log")
          if(kanalBul) kanalBul.send({embeds: [new genEmbed()
            .setDescription(`${message.author} isimli üye sürekli komut kullanımı sebebiyle bot tarafından otomatik yasaklandı, bu yasaklanmanın itirazını Sunucu sahibi ve bot sahibine iletmelidir.`)
            .addField(`Son Gönderilen İçerikler`, `${spamDedection.map(x => `\`${x.lastContent}\``).join("\n")}`,true)
            .addField("Son Kullanılan Komutlar", `${spamDedection.map((x,index) => `\`${index+1}.\` \`${sistem.botSettings.Prefixs[0]}${x.Command}\` (${message.guild.channels.cache.get(x.Channel)})` ).join("\n")}`, true)
          ]})
          message.channel.send(`${message.guild.emojiGöster(emojiler.chatSusturuldu)} ${message.author} Sürekli olarak komut kullanımı sebebiyle bot tarafından komut kullanımınız \`Devre-Dışı\` bırakıldı.`).then(x => {
          setTimeout(() => {
            x.delete()
          }, 7500);
          })
          
          await commandBlocks.updateOne({_id: message.member.id}, { $set: { Date: Date.now(), lastData: spamDedection } }, {upsert: true})
          if(spamCommandCount.has(message.author.id)) spamCommandCount.delete(message.author.id);
        }
        setTimeout(() => { if (spamCommandCount.has(message.author.id)) { spamCommandCount.delete(message.author.id) } }, ms("1m"))
      }  
      try {
          await Users.updateOne({ _id: message.author.id }, { $push: { "CommandsLogs": { Komut: komutcuklar, Kanal: message.channel.id, Tarih: Date.now() } } }, { upsert: true })
          client.logger.log(`${message.author.tag} (${message.author.id}) komut kullandı "${komutcuklar}" kullandığı kanal "${message.channel.name}"`, "cmd");
          if(TalentPerms) {
            let embed = new genEmbed()
            var rolismi = TalentPerms.Name || "Belirsiz"
            let uye = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if((TalentPerms.Permission && TalentPerms.Permission.length && !TalentPerms.Permission.some((id) => message.member.roles.cache.has(id))) && !roller.kurucuRolleri.some(oku => message.member.roles.cache.has(oku)) && !message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({embeds: [new genEmbed().setDescription(`${cevaplar.prefix} Bu komutu kullanabilmek için ${TalentPerms.Permission ? TalentPerms.Permission.filter(x => message.guild.roles.cache.get(x)).map(x => message.guild.roles.cache.get(x)).join(", ") + " rollerine sahip olmalısın!": ""}`)]}); 
            if (!uye) return message.channel.send({embeds: [new genEmbed().setDescription(`${TalentPerms.Roles.map(x => message.guild.roles.cache.get(x)).join(", ")} ${TalentPerms.Roles.length > 1 ? 'rollerini' : "rolü"} verebilmem için lütfen bir üyeyi etiketle __Örn:__ \`${sistem.botSettings.Prefixs[0]}${komutcuklar} @weise/ID\`! ${cevaplar.prefix}`)]}).then(x => setTimeout(() => { x.delete() }, 7500));
            if (TalentPerms.Roles.some(role => uye.roles.cache.has(role))) {
              await Users.updateOne({ _id: uye.id }, { $push: { "Roles": { rol: TalentPerms.Roles, mod: message.author.id, tarih: Date.now(), state: "Kaldırma" } } }, { upsert: true })
              TalentPerms.Roles.forEach(x => uye.roles.remove(x))
              message.reply({embeds: [new genEmbed().setDescription(`${message.guild.emojiGöster(emojiler.Onay)} Başarıyla ${uye}, isimli üyeden ${TalentPerms.Roles.map(x => message.guild.roles.cache.get(x)).join(", ")} ${TalentPerms.Roles.length > 1 ? 'rolleri' : "rolü"} geri alındı.`)]}).catch().then(x => setTimeout(() => { x.delete() }, 7500));
              message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined)
              message.guild.kanalBul("rol-al-log").send({embeds: [embed.setDescription(`${uye} isimli üyeden <t:${String(Date.now()).slice(0, 10)}:R> ${message.author} tarafından ${TalentPerms.Roles.map(x => message.guild.roles.cache.get(x)).join(", ")} adlı ${TalentPerms.Roles.length > 1 ? 'rolleri' : "rol"} geri alındı.`)]})
            }
            else  { 
              await Users.updateOne({ _id: uye.id }, { $push: { "Roles": { rol: TalentPerms.Roles, mod: message.author.id, tarih: Date.now(), state: "Ekleme" } } }, { upsert: true })
              uye.roles.add(TalentPerms.Roles); 
              message.reply({embeds: [new genEmbed().setDescription(`${message.guild.emojiGöster(emojiler.Onay)} Başarıyla ${uye}, isimli üyeye ${TalentPerms.Roles.map(x => message.guild.roles.cache.get(x)).join(", ")} ${TalentPerms.Roles.length > 1 ? 'rolleri' : "rolü"} verildi.`)]}).catch().then(x => setTimeout(() => { x.delete() }, 7500));
              message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined)
              message.guild.kanalBul("rol-ver-log").send({embeds: [embed.setDescription(`${uye} isimli üyeye <t:${String(Date.now()).slice(0, 10)}:R> ${message.author} tarafından ${TalentPerms.Roles.map(x => message.guild.roles.cache.get(x)).join(", ")} adlı ${TalentPerms.Roles.length > 1 ? 'rolleri' : "rol"} verildi.`)]})  
            }
          }
          calistirici = weise.commands.get(komutcuklar) || weise.aliases.get(komutcuklar);
          if(calistirici) {
            if((calistirici.Permissions && calistirici.Permissions.length && !calistirici.Permissions.some((id) => message.member.roles.cache.has(id) || message.member.permissions.has(id) || message.member.id == id) ) && !roller.kurucuRolleri.some(oku => message.member.roles.cache.has(oku)) && !message.member.permissions.has("ADMINISTRATOR") && !ayarlar.staff.includes(message.author.id)) {
               return message.reply({embeds: [new genEmbed().setDescription(`Bu komutu kullanmak için ${calistirici.Permissions ? calistirici.Permissions.filter(x => message.guild.roles.cache.get(x)).map(x => message.guild.roles.cache.get(x)).join(", ") + " rol(lerine) sahip olmalısın!": "yeterli yetkiye sahip değilsin."} ${cevaplar.prefix}`)]}).then(x => {
                setTimeout(() => {
                  x.delete().catch(err => {})
                }, 7500);
               });
            }
            calistirici.onRequest(weise, message, args);
          }
      } catch (err) {
        message.channel.send({content: `Bu komut çalıştırılırken hata oluştu... \`\`\`${err}\`\`\` `}).then(x => { 
          client.logger.log(`${komutcuklar} isimli komut çalıştırılırken hata oluştu.`,"error")
          setTimeout(() => {
            x.delete()
          }, 7500)
        })
     }
    } 

};

module.exports.config = {
    Event: "messageCreate"
};
