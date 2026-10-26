const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");



router.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.array("listing[images]"),
   validateListing,
  wrapAsync(listingController.createListing) );

 
//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Search Route (Must be before the /:id route)
router.get("/search", async (req, res) => {
    let { q } = req.query;
    if (!q) {
        return res.redirect("/listings");
    }
    const searchResults = await Listing.find({
        // I've added back the more robust search from the previous example
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
        ],
    });
    // You could also add a flash message if no results are found
    if(searchResults.length === 0){
        req.flash("error", "No listings found for your search.");
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs", { allListings: searchResults });
});


router.get("/category/:category", wrapAsync(listingController.filterByCategory));



router.route("/:id")
.get(wrapAsync (listingController.showListing))
.put( isLoggedIn, isOwner, upload.array("listing[images]"), validateListing, wrapAsync(listingController.updateListing) )
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",  isLoggedIn , isOwner, wrapAsync(listingController.renderEditForm));

// // Search Listings
// router.get("/search", async (req, res) => {
//   try {
//     const query = req.query.q || "";
//     const listings = await Listing.find({
//       $or: [
//         { title: { $regex: query, $options: "i" } },
//         { location: { $regex: query, $options: "i" } }
//       ]
//     });
//     res.render("listings/index.ejs", { allListings: listings });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Something went wrong!");
//   }
// });

// Add this route handler in your listings router file




module.exports = router;
