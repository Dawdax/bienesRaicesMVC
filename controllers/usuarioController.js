import {check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import Jwt  from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import {generarId, generarJWT} from '../helpers/tokens.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/email.js'

const formularioLogin = (req, res) =>{
    res.render('auth/login', {
        pagina: "Iniciar sesión",
        csrfToken: req.csrfToken()
    });
}
const autenticar = async (req, res) =>{
    //validación 
    await check('email').isEmail().withMessage("El email es obligatorio").run(req)
    await check('password').notEmpty().withMessage("La contraseña es obligatoria").run(req)

    let resultado = validationResult(req) 
    //Verificar que el resultado este vacío
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/login',{
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: resultado.array()           
        })
    }
    //Comprobar si el usurio existe 
    const {email, password} = req.body;

    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        //Errores
        return res.render('auth/login',{
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]          
        })
    }

    //Comprobar si el usuario está confirmado 
    if(!usuario.confirmado){
         //Errores
         return res.render('auth/login',{
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]          
        })
    }

    //Revisar la contraseña 
    if(!usuario.verificarPassword(password)){
         //Errores
         return res.render('auth/login',{
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'La contraseña es incorrecta'}] ,
            usuario: {
                email: req.body.email
            }        
        })
    }
    //Autenticar al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})

    //almacenar en un cookie 
    return res.cookie('_token', token, {
        httpOnly: true,

    }).redirect('/mis-propiedades')
     
}

const formularioRegistro = (req, res) =>{
    res.render('auth/registro', {
         pagina: 'Crear cuenta',
         csrfToken: req.csrfToken()
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
            csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
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
          pagina: 'Recupera tu acceso a Bienes Raices',
          csrfToken: req.csrfToken(),
    });
}

const resetearPassword = async (req, res) =>{
    //Valdiaciones
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacío
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),    
            errores: resultado.array()        
        })
    }

    //Si es un email, buscar el usuario y ver si existe +
    const { email} = req.body;
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),    
            errores: [{msg: 'El email no pertecene a ningún usuario'}]
        })
    }
    //Generar token y enviar email
    usuario.token = generarId();
    await usuario.save();

    //Enviar email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar un mensaje 
    res.render('templates/mensaje',{
        pagina: 'Reestablece tu contraseña',
        mensaje: 'Hemos enviado un email con las intrucciones'
    })

}

const comprobarToken = async (req,res) =>{
    const { token } = req.params;

    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Reestablecer tu contraseña',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    //Mostrar fomulario para modificar el password 
    res.render('auth/reset-password',{
        pagina: 'Restablece tu contraseña',
        csrfToken: req.csrfToken()
    })


}
const nuevoPassword = async (req,res) =>{
    //Validar password
    await check('password').isLength({min: 6}).withMessage("La contraseña debe ser de almenos 6 caracteres").run(req)
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        //errores 
        return res.render('auth/reset-password',{
            pagina: 'Restablece tu contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const {token} = req.params;
    const {password} = req.body;

    //Identificar quien hace el cambio 
    const usuario = await Usuario.findOne({where: {token}})
    
    //Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);

    //eliminar token 
    usuario.token = null;

    // guardar usuario 
    await usuario.save();

    //Renderizar vista
    res.render('auth/confirmar-cuenta', {
        pagina: 'Contraseña reestablecida',
        mensaje: 'La contraseña se actualizó correctamente'
    })

}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetearPassword,
    comprobarToken,
    nuevoPassword
}