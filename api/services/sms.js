class Sms {
  static senderPhone = process.env.TWILIO_PHONE_NUMBER;
  constructor() {
    this.client = this.init();
  }

  init = () => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require("twilio")(accountSid, authToken);

      return client;
    } catch (error) {
      console.log("Twilio client oluşturulurken bir sorunla karşılaşıldı\n", error, "\n");
    }
  };

  sendSms = async (to, smsMessage) => {
    try {
      const message = await this.client.messages.create({
        body: smsMessage,
        from: Sms.senderPhone,
        to,
      });
      console.log(message);
    } catch (error) {
      console.log("Sms gönderirken bir sorunla karşılaşıldı\n", error, "\n");
    }
  };
}

module.exports = Sms;
