import { DataTypes } from 'sequelize'
import bcrypt from 'bcrypt'
import db from '../config/db.js'
import { text } from 'express'
 

const Usuario = db.define('usuarios',{
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      token: DataTypes.STRING,
      confirmado: DataTypes.BOOLEAN
}, {
  hooks: {
    //Para hashear las contraseñas
    beforeCreate: async function(usuario) {
          const salt = await bcrypt.genSalt(10)
          usuario.password = await bcrypt.hash(usuario.password, salt);

    }
  },
  scopes:{
    //Eliminar password para no mostrarlo en la consulta de JWT
    eliminarPassword:{
      attributes:{
        exclude:['password','token','confirmado','createdAt','updatedAt']
      }
    }
  }
});

//Métodos personalizados 
Usuario.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}
//NO PUEDES USAR ARROW FUNCTION PORQUE UTILIZA This.password, porque no apunta el scop en el objeto actual, sino global

export default Usuario