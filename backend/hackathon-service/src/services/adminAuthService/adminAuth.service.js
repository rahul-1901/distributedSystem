import jwt from "jsonwebtoken";
import axios from "axios";
import { oauth2client } from "../../utils/googleAuth.utils.js";
import { BadRequestError } from "../../errors/BadRequestError.js";

export class AdminAuthService {
  constructor(adminRepository, logger) {
    this.adminRepository = adminRepository;

    this.logger = logger;
  }

  async googleLogin(code) {
    if (!code) {
      throw new BadRequestError("Google authorization code required");
    }

    const googleRes = await oauth2client.getToken(code);

    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleRes.tokens.access_token}`,
        },
      }
    );

    const { name, email, picture } = userRes.data;

    let admin = await this.adminRepository.getByEmail(email);

    if (!admin) {
      admin = await this.adminRepository.create({
        adminName: name,
        email,
        avatar: picture || "",
        role: "ADMIN",
        profileCompleted: false,
        isVerified: false,
        verificationStatus: "NOT_SUBMITTED",
      });

      this.logger.info(
        {
          adminId: admin._id,
          email,
        },
        "Admin account created"
      );
    } else {
      admin.lastLogin = new Date();

      if (picture && !admin.avatar) {
        admin.avatar = picture;
      }

      await this.adminRepository.save(admin);
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    return {
      success: true,
      token,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role,
        profileCompleted: admin.profileCompleted,
        isVerified: admin.isVerified,
        verificationStatus: admin.verificationStatus,
      },
    };
  }
}
