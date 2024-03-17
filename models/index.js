import Propiedad from './Propiedad.js'
import Precio  from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'

Propiedad.belongsTo(Precio, {foreignKey: 'fk_precioId'})
Propiedad.belongsTo(Categoria, {foreignKey: 'fk_categoriaId'})
Propiedad.belongsTo(Usuario, {foreignKey: 'fk_usuarioId'})

 


export{
    Propiedad,
    Precio,
    Categoria, 
    Usuario
}