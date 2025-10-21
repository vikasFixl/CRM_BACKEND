import { Candidate } from "../../../models/NHRM/Recruitement/candidateTracking.js";
import { Offer } from "../../../models/NHRM/Recruitement/offerManagement.js";
import { JobPosting } from "../../../models/NHRM/Recruitement/jobPostings.js";

// Create a new Offer
export const createOffer = async (req, res) => {
  try {
    const { candidate: candidateId, jobPosting: jobPostingId, offerDate, offerDetails } = req.body;

    // Ensure candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // Ensure job posting exists
    const job = await JobPosting.findById(jobPostingId);
    if (!job) return res.status(404).json({ message: "Job posting not found" });

    const offer = new Offer({
      candidate: candidateId,
      jobPosting: jobPostingId,
      offerDate,
      offerDetails,
    });

    const savedOffer = await offer.save();

    // Link offer to candidate
    candidate.offer = savedOffer._id;
    await candidate.save();

    res.status(201).json({ message: "Offer created successfully", offer: savedOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Offer
export const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const updatedOffer = await Offer.findByIdAndUpdate(offerId, req.body, { new: true });
    if (!updatedOffer) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer updated", offer: updatedOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Offer by ID
export const getOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId)
      .populate("candidate")
      .populate("jobPosting");

    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Offers (with optional filters)
export const getOffers = async (req, res) => {
  try {
    const { status, jobPosting, candidate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (jobPosting) filter.jobPosting = jobPosting;
    if (candidate) filter.candidate = candidate;

    const offers = await Offer.find(filter)
      .populate("candidate")
      .populate("jobPosting")
      .sort({ offerDate: -1 });

    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Offer Status (Pending → Accepted / Rejected)
export const updateOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { status, acceptedDate } = req.body;

    const offer = await Offer.findByIdAndUpdate(
      offerId,
      { status, acceptedDate: acceptedDate || Date.now(), updatedAt: Date.now() },
      { new: true }
    );

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer status updated", offer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Offer
export const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const deletedOffer = await Offer.findByIdAndDelete(offerId);
    if (!deletedOffer) return res.status(404).json({ message: "Offer not found" });

    // Remove reference from candidate
    await Candidate.findByIdAndUpdate(deletedOffer.candidate, { $unset: { offer: "" } });

    res.json({ message: "Offer deleted", offer: deletedOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
