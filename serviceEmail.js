require('dotenv').config();
const nodemailer = require("nodemailer");

function templeHTML(dataUserObj={}){
let datasendObj = {};
  switch (dataUserObj.type) {
    case 'recovery':
      datasendObj={
        "from" : dataUserObj?.from ||  process.env.EMAIL_FROM,
        "to" : dataUserObj?.email || "velardeluisangel@claudstudio.com" ,
        "subject" : dataUserObj?.subject || "Recuperacion de Usuario", 
        "html" : `<p>Se ha realizado una solicitud de recuperacion de contrasena, para proceder debe ingresar al siguiente hipervinculo:</p><a target='_blank' href='${process.env.APP_PROTOCOL}://${process.env.APP_DOMAIN}/password/${dataUserObj?.token}'>Click para recuperar contrasena</a>`,
      }
      break;
  
    default:
      break;
  }
return {...datasendObj};
}


// async..await is not allowed in global scope, must use a wrapper
async function sendEmails(queryObj = {}) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail(
    templeHTML({type: queryObj.type,email:queryObj.email,token:queryObj.token})
  );
  console.log("Message sent: %s", info.messageId);
}

exports.sendEmails = sendEmails;