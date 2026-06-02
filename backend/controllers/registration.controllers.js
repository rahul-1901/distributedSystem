import mongoose from "mongoose"
import UserModel from "../models/user.models.js"
import hackathonModel from "../models/hackathon.models.js"
import RegisteredParticipantsModel from "../models/registeredParticipants.js"

export const registerParicipants = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { name, contactNumber, college , gender , currentYearOfStudy, email, currentLocation, yearsOfExperience, workEmailAddress, teamId } = req.body;
        const userId = req.user._id;

        const alreadyRegistered = await RegisteredParticipantsModel.findOne({
            user: userId,
            hackathon: hackathonId
        });

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: "User is already registered for this hackathon"
            });
        }
        // create new registration
        const registration = await RegisteredParticipantsModel.create({
            user: userId,
            hackathon: hackathonId,
            team: teamId || null,
            name,
            contactNumber,
            college,
            currentYearOfStudy,
            gender,
            currentLocation,
            email,
            workEmailAddress,
            yearsOfExperience
        });

        // update user
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { registeredHackathons: hackathonId }
        });

        // update hackathon
        await hackathonModel.findByIdAndUpdate(hackathonId, {
            $addToSet: { registeredParticipants: registration._id },
            $inc: { numParticipants: 1 }
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            registration
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export const isregistered = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const userId = req.user._id;

        const hackathonObjectId = new mongoose.Types.ObjectId(hackathonId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const registration = await RegisteredParticipantsModel.findOne({
            hackathon: hackathonId,
            user: userId
        });

        res.json({
            isRegistered: !!registration,
            registration
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};