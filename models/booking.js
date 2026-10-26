const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;