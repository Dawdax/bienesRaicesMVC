import Jwt from "jsonwebtoken"
import {Usuario} from '../models/index.js'
const protegerRuta = async(req, res, next) => {
    //verificar si hay un token 
    const {_token} = req.cookies
    if(!_token){
        return res.redirect('/auth/login')
    }


    //Comprobar el token
    try {
        const decoded = Jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)
        console.log(usuario)

        //Almacenar el usuario al Req
        if(usuario){
            //lo almacenamos en req y en cualquier lugar que tengamos 
            //req y res se podrá utilizar 
            req.usuario = usuario

        }else{
            return res.clearCookie('_token').redirect('/auth/login')
        } 

        return next();
    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login')
    } 
}

export default protegerRuta