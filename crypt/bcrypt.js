const bcrypt = require("bcrypt")

const getHashPassword = async (password) => {
    saltRounds = 10
    try {
        let salt = await bcrypt.genSalt(saltRounds)
        let hashPassword = await bcrypt.hash(password, salt)
        return hashPassword
    } catch (err) {
        console.log("Error while creating Hash password " + err)
        return false
    }
}

const compareHashPassword = async (plainTextPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainTextPassword, hashedPassword)
    } catch (err) {
        console.log("Error while comparing passwords " + err)
        return false
    }
}

module.exports = { getHashPassword, compareHashPassword }
