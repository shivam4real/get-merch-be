const express = require("express")
const router = express.Router()

const USER = require("../model/User-Model")
const { getHashPassword, compareHashPassword } = require("../crypt/bcrypt")

const { getToken, decodeToken } = require("../jwt/jwt")

const validateJwtToken = require("../middleware/authMiddleware")

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
                    isAdmin: email === 'admin',
                })
                res.status(200).json({
                    success: true,
                    message: "user login sucessfully",
                    data: token,
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "Login Failed.",
                })
            }
        } else {
            res.status(400).json({
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

router.get("/getUserDetails", validateJwtToken, async (req, res) => {
    try {
        let email = req.user.email; // Extracted from decoded token
        let user = await USER.findOne({ email: email }).select({
            password: 0,
            __v: 0,
        });

        if (user) {
            res.status(200).json({
                success: true,
                data: user,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error " + err,
        });
    }
});

router.delete("/deleteUser/:id",validateJwtToken, async (req, res) => {
    let id = req.params.id
    try {
        let isUSerDeleted = await USER.deleteOne({ _id: id })
        if (isUSerDeleted.deletedCount) {
            res.json({
                success: true,
                message: "User deleted",
            })
        } else {
            res.json({
                success: false,
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

router.post("/changePassword", validateJwtToken, async (req, res) => {
    let email = req.user.email; // Extracted from decoded token
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    try {
        let user = await USER.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        let isSame = await compareHashPassword(oldPassword, user.password);
        if (!isSame) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect.",
            });
        }

        let hashedNewPassword = await getHashPassword(newPassword);
        let changePasswordResponse = await USER.updateOne(
            { email: email },
            { password: hashedNewPassword }
        );

        if (changePasswordResponse.modifiedCount) {
            res.json({
                success: true,
                message: "Password updated successfully.",
            });
        } else {
            res.json({
                success: false,
                message: "Password not updated.",
            });
        }
    } catch (err) {
        res.json({
            success: false,
            message: "Unable to update password " + err,
        });
    }
});

// Add a route to update the user profile
router.put("/updateProfile", validateJwtToken, async (req, res) => {
    try {
        let email = req.user.email; // Extracted from decoded token
        let updateFields = req.body;

        let updatedUser = await USER.findOneAndUpdate(
            { email: email },
            updateFields,
            { new: true, select: { password: 0, __v: 0 } }
        );

        if (updatedUser) {
            res.status(200).json({
                success: true,
                message: "User profile updated successfully.",
                data: updatedUser,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error " + err,
        });
    }
});

module.exports = router
