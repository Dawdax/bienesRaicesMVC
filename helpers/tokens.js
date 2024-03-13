import Jwt  from "jsonwebtoken";

//Al no poner llaves, se pone un return implicito
const generarJWT = (datos) => Jwt.sign({id: datos.id, nombre: datos.nombre}, process.env.JWT_SECRET, {expiresIn: '1d' })


const generarId = ()  => Date.now().toString(32) + Math.random().toString(32).substring(2);

export {
    generarId,
    generarJWT
}