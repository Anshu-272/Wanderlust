// const Listing = require("../models/listing");
// const NodeGeocoder = require('node-geocoder');
// const { cloudinary } = require("../cloudConfig.js");

// const options = {
//   provider: 'openstreetmap',
// };

// const geocoder = NodeGeocoder(options);

// module.exports.index = async (req, res) => {
//   const allListings = await Listing.find({});
//   res.render("listings/index.ejs",{ allListings });   
// };

// module.exports.renderNewForm = (req, res) =>{
//   res.render("listings/new.ejs");
// };

// // In controllers/listings.js

// module.exports.showListing = async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id).populate({
//       path: "reviews",
//       populate: { path: "author" },
//   }).populate("owner");

//   if (!listing) {
//       req.flash("error", "Listing you requested for does not exist");
//       return res.redirect("/listings");
//   }
  
//   // We have removed all the gem-finding logic.
//   // We now only pass the main "listing" to the page.
//   res.render("listings/show.ejs", { listing });
// };


// // In controllers/listings.js, replace the createListing function

// module.exports.createListing = async (req, res, next) => { 
//     let locationString = `${req.body.listing.location}, ${req.body.listing.country}`;
//     const geoData = await geocoder.geocode(locationString);

//     if (!geoData.length) {
//         req.flash("error", "Location not found. Please enter a more specific, valid location.");
//         return res.redirect("/listings/new");
//     }

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;

//     // VVV THIS IS THE NEW PART FOR MULTIPLE IMAGES VVV
//     // It takes the array of files from req.files and saves them to the new "images" field.
//     newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
//     // ^^^ END OF NEW PART ^^^

//     newListing.geometry = {
//         type: "Point",
//         coordinates: [geoApidata[0].longitude, geoData[0].latitude]
//     };
    
//     await newListing.save();
    
//     req.flash("success", "New Listing Created !");
//     res.redirect("/listings");
// };


// module.exports.renderEditForm = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     if(!listing) {
//         req.flash("error", "Listing you requested for does not exist");
//         return res.redirect("/listings");
//     }

//     let originalImageUrl = ""; 
//     // This is the new, much safer logic
//     if (listing.images && listing.images.length > 0 && typeof listing.images[0].url === 'string') {
//         // Use the new 'images' array only if the URL is a string
//         originalImageUrl = listing.images[0].url.replace("/upload", "/upload/w_250");
//     } else if (listing.image && typeof listing.image.url === 'string') {
//         // Fall back to the old 'image' object only if the URL is a string
//         originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
//     }
    
//     res.render("listings/edit.ejs", { listing, originalImageUrl });
// };

// // In controllers/listings.js

// // In controllers/listings.js

// // In controllers/listings.js

// module.exports.updateListing = async (req, res) => {
//     let { id } = req.params;

//     // 1. Find the listing we are editing
//     const listing = await Listing.findById(id);
//     if (!listing) {
//         req.flash("error", "Cannot find that listing!");
//         return res.redirect("/listings");
//     }

//     // 2. Update the simple text fields
//     // This safely copies title, description, price, etc. from the form
//     Object.assign(listing, req.body.listing);

//     // 3. Add any NEW images that were uploaded
//     if (req.files && req.files.length > 0) {
//         const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
//         listing.images.push(...newImages); // Add new images to the existing array
//     }

//     // 4. Delete any images that were selected
//     if (req.body.deleteImages && req.body.deleteImages.length > 0) {
//         // First, filter out the images to be kept from the listing's array
//         listing.images = listing.images.filter(image => !req.body.deleteImages.includes(image.filename));
        
//         // Then, delete the actual files from Cloudinary
//         for (let filename of req.body.deleteImages) {
//             await cloudinary.uploader.destroy(filename);
//         }
//     }

//     // 5. Save the listing with ALL changes at once
//     await listing.save();

//     req.flash("success", "Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };

// module.exports.destroyListing = async (req, res) => {
//   let { id } = req.params;
//   let deletedListing = await Listing.findByIdAndDelete(id);
//   console.log(deletedListing);
//   req.flash("success", "Listing Deleted!");
//   res.redirect("/listings");
// };


// module.exports.filterByCategory = async (req, res) => {
//     const { category } = req.params;
//     const allListings = await Listing.find({ category: { $regex: new RegExp(category, "i") } });
    
//     // You can add a flash message for when no listings are found
//     if (allListings.length === 0) {
//         req.flash("error", "No listings found for this category.");
//         return res.redirect("/listings");
//     }

//     res.render("listings/index.ejs", { allListings, currentCategory: category });
// };

const Listing = require("../models/listing");
const NodeGeocoder = require('node-geocoder');
const { cloudinary } = require("../cloudConfig.js");

// Geocoder Setup
const options = {
  provider: 'openstreetmap',
};
const geocoder = NodeGeocoder(options);

// 1. Index Route (Show all listings)
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs",{ allListings });
};

// 2. Render New Form Route
module.exports.renderNewForm = (req, res) =>{
  res.render("listings/new.ejs");
};

// 3. Show Listing Route (Show one listing)
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: { path: "author" },
    }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// 4. Create Listing Route (WITH FINAL FIX)
// module.exports.createListing = async (req, res, next) => {
//     try {
//         console.log("--- STEP 1: CREATE LISTING STARTED ---");
//         console.log("Uploaded files (req.files):", req.files);

//         let locationString = `${req.body.listing.location}, ${req.body.listing.country}`;
//         const geoData = await geocoder.geocode(locationString);
//         console.log("--- STEP 2: GEOCODER RESPONSE ---", geoData);

//         if (!geoData.length) {
//             req.flash("error", "Location not found.");
//             return res.redirect("/listings/new");
//         }

//         const newListing = new Listing(req.body.listing);
//         newListing.owner = req.user._id;
        
//         console.log("--- STEP 3: LISTING OBJECT BEFORE IMAGES ARE ADDED ---", newListing);

//         newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        
//         console.log("--- STEP 4: LISTING OBJECT AFTER IMAGES ARE ADDED ---", newListing);

//         newListing.geometry = {
//             type: "Point",
//             coordinates: [geoData[0].longitude, geoData[0].latitude]
//         };

//         console.log("--- STEP 5: FINAL LISTING OBJECT BEFORE SAVE ---", newListing);
        
//         await newListing.save();
//         console.log("--- STEP 6: LISTING SAVED SUCCESSFULLY ---");
        
//         req.flash("success", "New Listing Created!");
//         res.redirect("/listings");

//     } catch (error) {
//         console.log("!!!!!! AN ERROR OCCURRED IN createListing !!!!!!");
//         console.log(error);
//         req.flash("error", "Something went wrong. Could not create listing.");
//         res.redirect("/listings/new");
//     }
// };

// A temporary function just for debugging the image issue
// This is the final, clean version for creating listings.
module.exports.createListing = async (req, res, next) => {
    let locationString = `${req.body.listing.location}, ${req.body.listing.country}`;
    const geoData = await geocoder.geocode(locationString);
    if (!geoData.length) {
        req.flash("error", "Location not found. Please enter a more specific, valid location.");
        return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newListing.geometry = {
        type: "Point",
        coordinates: [geoData[0].longitude, geoData[0].latitude]
    };

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// 5. Render Edit Form Route (WITH FINAL FIX)
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = ""; 
    if (listing.images && listing.images.length > 0 && typeof listing.images[0].url === 'string') {
        originalImageUrl = listing.images[0].url.replace("/upload", "/upload/w_250");
    } else if (listing.image && typeof listing.image.url === 'string') {
        originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
    }
    
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// 6. Update Listing Route (WITH FINAL FIX)
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }

    Object.assign(listing, req.body.listing);

    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        if (!listing.images) {
            listing.images = [];
        }
        listing.images.push(...newImages);
    }

    if (req.body.deleteImages && req.body.deleteImages.length > 0) {
        listing.images = listing.images.filter(image => !req.body.deleteImages.includes(image.filename));
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// 7. Destroy Listing Route
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

// 8. Filter by Category Route
module.exports.filterByCategory = async (req, res) => {
    const { category } = req.params;
    const allListings = await Listing.find({ category: { $regex: new RegExp(category, "i") } });
    
    if (allListings.length === 0) {
        req.flash("error", "No listings found for this category.");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings, currentCategory: category });
};