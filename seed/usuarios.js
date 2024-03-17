import bcryp from 'bcrypt'
const usuarios = [
    {
        nombre: 'David',
        email: 'David@gmail.com',
        confirmado: 1,
        password: bcryp.hashSync('1234567', 10)
    }
]
export default usuarios