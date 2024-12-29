const chalk = require("chalk");

class Mailer {
  static mailer = require("nodemailer");
  constructor() {
    this.transporter = Mailer.mailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
    this.senderEmail = process.env.EMAIL;
  }

  createFoundMailText(foundTickets, date, amount) {
    try {
      let mailText = "";
      foundTickets.forEach(({ hourInfo }) => {
        mailText += `${hourInfo} \n`;
      });

      var mail = {
        subject: "BİLET BULUNDU",
        text:
          "\n\n" +
          date +
          ` tarihinde ${amount} adet bilet bulunmuştur.\nBiletlerin saatleri : \n${mailText}\n Tcdd bilet satın alma : "ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/tcddWebContent.jsf"`,
      };
      return mail;
    } catch (error) {
      console.log("Mail oluşturulurken bir sorunla karşılaşıldı\n", error, "\n");
    }
  }

  createStartMailText(date, amount) {
    try {
      return {
        subject: "BİLET ARAMAYA BAŞLANDI",
        text: `\n${date} tarihi için ${amount} adet bilet aramaya başladım.\n Bilet bulduğumda haber vereceğim.`,
      };
    } catch (error) {
      console.log("Mail oluşturulurken bir sorunla karşılaşıldı\n", error, "\n");
    }
  }

  sendMail(to, { subject, text }) {
    try {
      this.transporter.sendMail(
        {
          from: this.senderEmail,
          to: to,
          subject: subject,
          text: text,
        },
        (error, _) => {
          if (error) {
            console.log("Mail Gönderirken bir sorunla karşılaşıldı\n", error, "\n");
            throw new Error("Mail Gönderirken bir sorunla karşılaşıldı");
          }
          console.log(chalk.bgBlack.white("Mail başarıyla gönderildi\nAlıcı Mail: " + to + "\n"));
        }
      );
    } catch (error) {
      console.log("Mail Gönderirken bir sorunla karşılaşıldı\n", error, "\n");
      console.log(error);
    }
  }
}

module.exports = Mailer;
