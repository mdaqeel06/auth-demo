const emailHtml = (verificationLink) => `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Confirm your email</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #333;">Confirm your email address</h2>
            <p style="color: #555;">
              Hey there,<br /><br />
              Thanks for signing up for this <strong>authentication demo project</strong> built by Aqeel!
              <br /><br />
              Please click the button below to verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #375a7f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p style="color: #777; font-size: 14px;">
              If you didn’t request this, you can safely ignore the message.
            </p>
            <p style="color: #aaa; font-size: 12px;">
              — Aqeel
            </p>
          </div>
        </body>
      </html>`;

module.exports = { emailHtml };
