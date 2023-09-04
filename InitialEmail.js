require('dotenv').config();
const nodemailer = require("nodemailer");

const username = `${process.env.REACT_APP_SMTP_USERNAME}`
const password = `${process.env.REACT_APP_SMTP_PASSWORD}`


const InitialEmail = async (normalUsername, lowerCaseEmail) => {
    let transport = nodemailer.createTransport({
        host: "smtp.dreamhost.com",
        port: 587,
        auth: {
          user: `${username}`,
          pass: `${password}`
        }
      });


      // Email them the token
      const mailRes = await transport.sendMail({
        from: 'admin@honestpatina.com',
        to: lowerCaseEmail,
        subject: `Welcome to Honest Patina!`,
        // text: 'Honest Patina email reset token: ' + `${resetToken}`,
        html:
        `
        <body>
          <div style="background-color:#00b8ff; width: 50rem; height:5rem; margin: auto; border-radius: 20px 20px 0 0;"></div>
          <div style="width: 50rem; height:20rem; margin: auto; background-color: #e9ecef;">
              <div style="height: 1rem;"></div>
              <div style="margin: auto; padding: 2rem 0 0 2rem;">
                  <p style="color:black; display: flex; flex-wrap: wrap; justify-content: center; font-size: 3vh;">
                      Thank you for signing up to &nbsp;<strong>Honest Patina</strong>!   
                  </p>
              </div>
                <a href="https://honestpatina.com/login" style="color:black; display: flex; flex-wrap: wrap; justify-content: center; text-decoration: none; padding: 0.5rem 2rem">
                  <button style="background-color: #00b8ff; color:white; padding:10px; border-radius:10px; height: 3rem; width: 20rem; font-size: 1rem;">Login</button>
              </a>        
          </div>
          <div style="background-color:#00b8ff; width: 50rem; height:5rem; margin: auto; border-radius: 0 0 20px 20px;"></div>
        </body>
        `
      });
      console.log(mailRes)
}

module.exports = InitialEmail;

