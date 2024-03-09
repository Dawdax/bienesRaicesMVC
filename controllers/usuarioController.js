import {check, validationResult} from 'express-validator'
import Usuario from '../models/Usuario.js'
import {generarId} from '../helpers/tokens.js'
import {emailRegistro} from '../helpers/email.js'

const formularioLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: "Iniciar sesión"
    });
}

const formularioRegistro = (req, res) =>{
    res.render('auth/registro', {
         pagina: 'Crear cuenta'
    });
}

const registrar = async (req, res) =>{
    //Validacion
    await check('nombre').notEmpty().withMessage("El nombre no puede ir vacío").run(req)
    await check('email').isEmail().withMessage("Ingrese un email válido").run(req)
    await check('password').isLength({min: 6}).withMessage("La contraseña debe ser de almenos 6 caracteres").run(req)
    await check('repetir_password').equals(req.body.password).withMessage("Las contraseñas no son iguales").run(req)

    let resultado = validationResult(req) 
    //Verificar que el resultado este vacío
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email
            }
            
        })
    }

    //extraer los datos 
    const {nombre, email, password} = req.body

    //Verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne({where:{email}})
    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear cuenta',
            errores: [{msg:'El usuario ya está registrado'}],
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email
            }
            
        })
    }

    //Almacenar un usuario 
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })
    //Envía email de confirmación 
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })


     //Mostrar mensaje de confirmación 
     res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de confirmación.'
     })
}   

//Función que confirma una cuenta 
const confirmar = async (req, res) =>{
     const {token} = req.params;
      
     //Verificar si el token es válido 
    const usuario = await Usuario.findOne({ where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo por favor.',
            error: true

        })
    }
    //Confirmar la cuenta

    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();
    res.render('auth/confirmar-cuenta', {
        pagina: 'ECuenta confirmada',
        mensaje: 'La cuenta se confirmó correctamente',
        error: false
    })

      
}

const formularioOlvidePassword = (req, res) =>{
    res.render('auth/olvide-password', {
          pagina: 'Recupera tu acceso a Bienes Raices'
    });
}


export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword
}