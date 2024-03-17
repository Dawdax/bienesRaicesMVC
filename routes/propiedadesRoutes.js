import express from "express"
import { body } from "express-validator";
import {admin, crear,guardar} from '../controllers/propiedadController.js'
import protegerRuta from "../middleware/protegerRuta.js";

const router = express.Router();


router.get('/mis-propiedades', protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion no puede ir vacía').isLength({max:250}).withMessage('La descripción debe tener un máximo de 250 Caracteres'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),    
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),    
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),    
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamiento'),    
    body('wc').isNumeric().withMessage('Selecciona la cantidad de wc/baños'),    
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'), 
    guardar
)

export default router