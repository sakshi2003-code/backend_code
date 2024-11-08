import{Router} from"express";
import {registerUser,
    loginUser ,
    logoutUser,
    refreshAccessToken,
     changeCurrentPassword, 
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChhanelProfile,
     getWatchHistory} from "../controllers/user.controller.js"
import {upload} from"../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router=Router();

router.route("/register").post(

    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)

// secure routes
 router.route("/logout").post(verifyJWT,logoutUser)
//  hmne verifyJWT m next isiliye diya tha taki confuse na ho phle kisko cahlana h yha pe
// router.route("/login").post(registerUser)


// endpoint route for user refresh token
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar) //isme ek file b aaegi isliye upload multer use kr rkha

router.route("/update-cover_image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChhanelProfile) //isme hmne data params se le rkha isliye

router.route("/history").get(verifyJWT,getWatchHistory)
export default router;