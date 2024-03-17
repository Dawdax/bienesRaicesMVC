import { exit } from 'node:process'
import categorias from './categorias.js'
import precios from './precios.js'
import usuarios from './usuarios.js'
import db from '../config/db.js'
import { Categoria, Precio, Usuario } from '../models/index.js'

const importarDatos = async () => {
    try {
        //Autenticar 
        await db.authenticate()

        //Generar las columnas 
        await db.sync()

        //Insertamos los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log("Datos importados correctamente")
        exit(0);

    } catch (error) {
        console.log(error);
        exit(1);
    }
}

const eliminarDatos = async () => {
    try {
        //FORMA 1  ELIMINA SOLO CONTENIDO DE TABLA 
      //  await Promise.all([
           //El truncate eliminar pero reinicia desde 1 el id
           //Categoria.destroy({ where: {}, truncate: true }),
           //Precio.destroy({ where: {}, truncate: true })
    //])
    //FORMA 2 ELIMINA TODO, HACE UN DROP TABLES
    await db.sync({force: true})
    console.log("Datos eliminados correctamente");
    exit(0)     
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if (process.argv[2] === "-i") {
    importarDatos();
}
if (process.argv[2] === "-e") {
    eliminarDatos();
}