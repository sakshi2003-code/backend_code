import mongoose ,{Schema} from "mongoose"

const subscriptionSchema =new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // one who is subscribing
         ref:"User"
    },
    chhanel:{
        type:Schema.Types.ObjectId, // one whom is subscriber and subscribing
         ref:"User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)