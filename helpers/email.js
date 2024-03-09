import nodemailer from 'nodemailer'

const emailRegistro = async(datos) =>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      const {email, nombre, token} = datos

      //Enviar email
      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirmación de cuenta | BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
              <p> Hola ${nombre}, comprueba tu cuenta en BienesRaices.com </p>

              <P>Tu cuenta ya está lista, solo debes confirmarla en el sigueinte enlace:
              <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}" > Confirmar cuenta </a> 
              </p>
              <p>el enlace es de un solo. </p>
              </br>
              </br>
              <p>Si tú no creaste ésta cuenta, puedes ignorar el mensaje </p>
        ` 
      })
}

export{
    emailRegistro
}