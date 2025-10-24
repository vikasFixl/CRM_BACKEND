import { Candidate } from "../../../models/NHRM/Recruitement/candidateTracking.js";
import { Offer } from "../../../models/NHRM/Recruitement/offerManagement.js";
import { JobPosting } from "../../../models/NHRM/Recruitement/jobPostings.js";
import Org from "../../../models/OrgModel.js";

// ---------------------------- CREATE OFFER ----------------------------
export const createOffer = async (req, res) => {
  try {
    const { orgId: organization } = req.orgUser;
    const { candidate: candidateId, jobPosting: jobPostingId, offerDate, offerDetails } = req.body;
    if (!candidateId || !jobPostingId || !offerDate || !offerDetails) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1️⃣ Ensure candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // 2️⃣ Ensure job posting exists
    const job = await JobPosting.findById(jobPostingId);
    if (!job) return res.status(404).json({ message: "Job posting not found" });


    const OfferExists = await Offer.findOne({ candidate: candidateId, jobPosting: jobPostingId });
    if (OfferExists) return res.status(400).json({ message: "Offer already exists for this candidate and job posting" });

    // 3️⃣ Create offer
    const offer = new Offer({
      organization,
      candidate: candidateId,
      jobPosting: jobPostingId,
      position: job.position,
      offerDate,
      offerDetails,
    });

    const savedOffer = await offer.save();

    // 4️⃣ Link offer to candidate
    candidate.offer = savedOffer._id;
    await candidate.save();

    await Offer.populate(savedOffer, [{ path: "position" }]);

    res.status(201).json({ message: "Offer created successfully", offer: savedOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------- UPDATE OFFER ----------------------------
export const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const organization = req.orgUser.orgId;
    const updatedOffer = await Offer.findByIdAndUpdate({ _id: offerId, organization }, req.body, { new: true });

    if (!updatedOffer) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer updated successfully", offer: updatedOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------- GET OFFER BY ID ----------------------------
export const getOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;
    const organization = req.orgUser.orgId;
    const offer = await Offer.findOne({ _id: offerId, organization })
      .populate("candidate", "firstName email status")
      .populate("jobPosting", "title location")
      .populate({
        path: "position",
        select: "title level department",
        populate: { path: "department", select: "name" } // populate the department of the position
      });

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer fetched successfully", offer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------- GET ALL OFFERS ----------------------------
export const getAllOffers = async (req, res) => {
  try {
    const { status, jobPosting, candidate, page = 1, limit = 20 } = req.query;
    const organization = req.orgUser.orgId;
    // Build filter object
    const filter = { Organization: organization };
    if (status) filter.status = status;
    if (jobPosting) filter.jobPosting = jobPosting;
    if (candidate) filter.candidate = candidate;

    // Convert page & limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch offers with pagination
    const offers = await Offer.find(filter)
      .populate("candidate", "firstName lastName email status")
      .populate("jobPosting", "title department location")
      .populate("position", "title level")
      .sort({ offerDate: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Total count for pagination info
    const totalOffers = await Offer.countDocuments(filter);
    const totalPages = Math.ceil(totalOffers / limitNumber);

    res.json({
      message: "Offers fetched successfully",
      offers,
      pagination: {
        totalOffers,
        totalPages,
        currentPage: pageNumber,
        pageSize: limitNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------------------- UPDATE OFFER STATUS ----------------------------
export const updateOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { status, acceptedDate } = req.body;
    const organization = req.orgUser.orgId;
    const offer = await Offer.findByIdAndUpdate(
      { _id: offerId, organization },
      { status, acceptedDate: acceptedDate || Date.now(), updatedAt: Date.now() },
      { new: true }
    );

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer status updated successfully", offer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------- DELETE OFFER ----------------------------
export const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const organization = req.orgUser.orgId;
    const deletedOffer = await Offer.findByIdAndDelete({ _id: offerId, organization });

    if (!deletedOffer) return res.status(404).json({ message: "Offer not found" });

    // Remove reference from candidate
    await Candidate.findByIdAndUpdate(deletedOffer.candidate, { $unset: { offer: "" } });

    res.json({ message: "Offer deleted successfully", offer: deletedOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------- GET OFFERS BY CANDIDATE ID ----------------------------
export const getOffersByCandidateId = async (req, res) => {
  try {
    const { candidateId } = req.params;
     const  organization  = req.orgUser.orgId;

    const candidate = await Candidate.findOne({ _id: candidateId, organization });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const offers = await Offer.find({ candidate: candidateId, organization })
      .populate("jobPosting", "title department location")
      .populate("position", "title level");

    res.json({ message: "Offers fetched successfully for candidate", candidate: { email: candidate.email, name: candidate.firstName + " " + candidate.lastName }, offers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
