const { bgBlue, black, green } = require("chalk");

const { exec } = require('child_process');

const mongodbServiceName = 'mongodb';

const checkInterval = 5000;

function checkMongoDBStatus() {
  exec(`sc query ${mongodbServiceName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Hata oluştu: ${error}`);
      return;
    }

    if (stdout.includes('STATE              : 1  STOPPED')) {
      console.log('MongoDB servisi durmuş. Başlatılıyor...');
      startMongoDBService();
    } else {
      console.log('MongoDB servisi çalışıyor.');
    }
  });
}

function startMongoDBService() {
  exec(`net start ${mongodbServiceName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Başlatma hatası: ${error}`);
    } else {
      console.log('MongoDB servisi başlatıldı.');
    }
  });
}

setInterval(checkMongoDBStatus, checkInterval);
checkMongoDBStatus();


class Mongoose {
    static Connect(active = sistem.Database.Active, url = sistem.Database.MongoURL) {
        if(active) {
            require('mongoose').connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: false,
            }).then(() => {
                setTimeout(() => {
                    client.logger.log(`${black.bgHex('#D9A384')(client.botName.toUpperCase())} Connected to the MongoDB.`, "mongodb");
                }, 3000)
            }).catch((err) => {
                client.logger.log(`${black.bgHex('#D9A384')(client.botName.toUpperCase())} Unable to connect to the MongoDB.` + err, "error");
                startMongoDBService()
                exec('pm2 restart all');
            });
        }
    }
}

module.exports = { Mongoose }