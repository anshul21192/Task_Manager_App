const sgMail=require('@sendgrid/mail');

const sendgridAPIKey='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';

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'19bei012@ietdavv.edu.in',
        subject:'Thanks for joining in!',
        text:`Welcome to app, ${name}. Let me know how you get along.`,
    });
}

const sendGoogByeEmail=(email, name)=>{
    sgMail.send({
        to:email,
        from:'19bei012@ietdavv.edu.in',
        subject:'Good Bye Buddy!',
        text:`Good bye bro, ${name} we hope to meet you soon/.`
    });
}

module.exports={
    sendWelcomeEmail,
    sendGoogByeEmail,
}