import { body, validationResult } from 'express-validator';
import {Categoria, Precio, Propiedad} from '../models/index.js';


const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        barra: true
    })
}
//Formulario para crear una nueva propiedad
const crear = async (req, res) => {
    //Consultar modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear propiedad',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}
const guardar =  async (req, res) => {
    //Validación
    let resultado = validationResult(req)
    if (!resultado.isEmpty()) {

        //Consultar modelo de Precio y Categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        return res.render('propiedades/crear', {
            pagina: 'Crear propiedad',
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    //Aplicamos destructuración para no poner  titulo: req.body.titulo y que se vea más limpio en propiedadGuardado
    const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: fk_precioId, categoria: fk_categoriaId } = req.body
    //Crear registro 
    try {
        const propiedadGuardado = await Propiedad.create({
            titulo, 
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            fk_precioId,
            fk_categoriaId

        })

    } catch (error) {
        console.log(error);
    }


}

export {
    admin,
    crear,
    guardar
}