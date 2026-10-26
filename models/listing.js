const mongoose = require("mongoose");
// const review = require("./review");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { ref } = require("joi");
 
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },    
    description: String,
    images:[
      {
        url: String,
        filename: String,
      }
    ], 
    image: { 
    url: String,
    filename: String,
    },
        
    price: Number,
    location: String,
    country: String,

     geometry: {      // <-- ADD THIS ENTIRE OBJECT
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // This will be an array of numbers [longitude, latitude]
            required: true
        }
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    
    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Booking"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: String,
        required: true
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
          await Review.deleteMany({_id : {$in: listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;