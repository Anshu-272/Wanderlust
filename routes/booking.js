const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const { isLoggedIn } = require("../middleware.js"); // Assuming your middleware is here

// Create Booking Route
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        const newBooking = new Booking(req.body.booking);
        newBooking.user = req.user._id;
        newBooking.listing = listing._id;

        await newBooking.save();

        // Add booking to the listing's booking array
        listing.bookings.push(newBooking);
        await listing.save();

        req.flash("success", "Booking confirmed!");
        res.redirect(`/listings/${listing._id}`);

    } catch (err) {
        req.flash("error", "Something went wrong, could not create booking.");
        res.redirect(`/listings/${req.params.id}`);
    }
});

module.exports = router;