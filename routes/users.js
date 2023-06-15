const express = require("express")
const router = express.Router()

const USER = require("../model/User-Model")
const { getHashPassword, compareHashPassword } = require("../crypt/bcrypt")

const { getToken, decodeToken } = require("../jwt/jwt")

router.post("/login", async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    try {
        let user = await USER.findOne({
            email: email,
        })
        if (user) {
            // User is present , compare password
            let isSame = await compareHashPassword(password, user.password)
            if (isSame) {
                // Login Success Send the token
                let token = await getToken({
                    email: email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                })
                res.json({
                    success: true,
                    message: "user login sucessfully",
                    data: token,
                })
            } else {
                res.json({
                    success: false,
                    message: "Login Failed.",
                })
            }
        } else {
            res.json({
                success: false,
                message: "Login Failed.",
            })
        }
    } catch (err) {
        res.json({
            success: false,
            message: "Error " + err,
        })
    }
})

router.post("/register", async (req, res) => {
    let { email, password, firstName, lastName, mobile } = req.body
    try {
        let hashedPassword = await getHashPassword(password)
        let user = new USER({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            mobile: mobile,
        })
        let addUser = await user.save()
        if (addUser) {
            let token = await getToken({
                email: email,
                firstName: firstName,
                lastName: lastName,
            })
            res.json({
                success: true,
                message: "User added.",
                data: token,
            })
        }
    } catch (err) {
        res.json({
            success: false,
            message: "ERR " + err,
        })
    }
})

router.get("/getUserList", decodeToken, async (req, res) => {
    try {
        let userList = await USER.find({}).select({
            password: 0,
            _id: 0,
            __v: 0,
        })
        res.json({
            success: true,
            data: userList,
        })
    } catch (err) {
        res.json({
            success: false,
            message: "Unable to fetch user list " + err,
        })
    }
})

router.post("/deleteUser", async (req, res) => {
    let email = req.body.email
    try {
        let isUSerDeleted = await USER.deleteOne({ email: email })
        if (isUSerDeleted.deletedCount) {
            res.json({
                success: true,
                message: "User deleted",
            })
        } else {
            res.json({
                success: true,
                message: "User Not found",
            })
        }
    } catch (err) {
        res.json({
            success: false,
            message: "Unable to delete user " + err,
        })
    }
})

router.post("/changePassword", async (req, res) => {
    let email = req.body.email
    let oldPassword = req.body.oldPassword
    let newPassword = req.body.newPassword

    try {
        let changePasswordResponse = await USER.updateOne(
            { email: email },
            { password: newPassword }
        )
        if (changePasswordResponse.modifiedCount) {
            res.json({
                success: true,
                message: "User deleted",
            })
        } else {
            res.json({
                success: false,
                message: "Password Not updated.",
            })
        }
    } catch (err) {
        res.json({
            success: false,
            message: "Unable to delete user " + err,
        })
    }
})

module.exports = router
