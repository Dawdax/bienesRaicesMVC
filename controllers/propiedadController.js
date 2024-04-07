import { body, validationResult } from 'express-validator';
import { Categoria, Precio, Propiedad } from '../models/index.js';
import {unlink} from 'node:fs/promises'


const admin = async (req, res) => {
    const { id } = req.usuario

    const propiedades = await Propiedad.findAll({
        where: {
            fk_usuarioId: id
        },
        //Haremos un inner join, curzando con categoria y le ponemos alias categoria
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as: 'precio' }
        ]
    })

    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        propiedades,
        csrfToken: req.csrfToken()
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
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}
const guardar = async (req, res) => {
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
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }
    //Crear registro 
    //Aplicamos destructuración para no poner  titulo: req.body.titulo y que se vea más limpio en propiedadGuardado
    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: fk_precioId, categoria: fk_categoriaId } = req.body
    const { id: fk_usuarioId } = req.usuario
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
            fk_categoriaId,
            fk_usuarioId,
            imagen: ''

        })
        const { id } = propiedadGuardado
        res.redirect(`/propiedades/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error);
    }
}

const agregarImagen = async (req, res) => {
    const { id } = req.params

    //validar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad no esté publicada 
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertecene a quien visite esta página 
    if (req.usuario.id.toString() !== propiedad.fk_usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad

    })
}

const almanecenarImagen = async (req, res) => {
    const { id } = req.params

    //validar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad no esté publicada 
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertecene a quien visite esta página 
    if (req.usuario.id.toString() !== propiedad.fk_usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {
        //Almancenar la imagen y publicar propiedad 
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();
        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error)
    }
}

const editar = async (req, res) => {
    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.fk_usuarioId.toString() != req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }
    //Consultar modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}
const GuardarCambios = async (req, res) => {
    //Verificar la validación 
    let resultado = validationResult(req)
    if (!resultado.isEmpty()) {

        //Consultar modelo de Precio y Categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        return res.render('propiedades/editar', {
            pagina: `Editar propiedad`,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.fk_usuarioId.toString() != req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    //Reescribir el objeto y hacer los cambios
    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: fk_precioId, categoria: fk_categoriaId } = req.body

        propiedad.set({
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
        await propiedad.save();
        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error)
    }
}

const eliminar = async (req, res) => {
    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la URL, es quien creo la propiedad
    if (propiedad.fk_usuarioId.toString() != req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    //Eliminar la imagen asociada
    await unlink(`public/uploads/${propiedad.imagen}`)

    //Eliminar la propiedad
    await propiedad.destroy();
    res.redirect('/mis-propiedades')

}

//Muestra una propiedad 
const mostrarPropiedad = async (req, res) =>{
    res.render('propiedad/mostrar',{
        
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almanecenarImagen,
    editar,
    GuardarCambios,
    eliminar,
    mostrarPropiedad

}