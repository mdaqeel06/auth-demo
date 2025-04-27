const Mailjet = require("node-mailjet");
require("dotenv").config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_APIKEY_PUBLIC,
  process.env.MAILJET_APIKEY_PRIVATE
);

const sendMail = async ({ to, subject, text, html }) => {
  try {
    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "mdaqeel0626@gmail.com",
            Name: "Aqeel Mohammed",
          },
          To: [
            {
              Email: to,
              Name: to.split("@")[0],
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    });

    console.log("Mail sent:", result.body.Messages[0].To[0].Email);
    return true;
  } catch (err) {
    console.error("Mailjet Error:", err?.response?.body || err);
    return false;
  }
};

module.exports = { sendMail };
