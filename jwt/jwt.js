const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET

const getToken = async (data) => {
    try {
        const token = await jwt.sign(data, JWT_SECRET)
        return token
    } catch (err) {
        console.log("Token Error " + err)
        return false
    }
}

const decodeToken = async (req, res, next) => {
    let token = req.header("Authorization")
    if (!token) {
        res.status(401).json({
            sucess: false,
            message: "Token Required.",
        })
    } else {
        try {
            const decode = await jwt.verify(token, JWT_SECRET)
            req.decode = decode.user
            next()
        } catch (err) {
            res.status(401).json({
                sucess: false,
                message: err,
            })
        }
    }
}

module.exports = { getToken, decodeToken }
