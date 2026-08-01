import axios from "axios";
import userRepository from "../repositories/user.repository.js";
import tokenService from "./token.service.js";
import { addEmailJob } from "../jobs/email.job.js";
import { oauth2client } from "../utils/googleAuth.utils.js";

export class OAuthService {
  async googleLogin(code) {
    if (!code) {
      return {
        statusCode: 400,
        success: false,
        message: "Code not provided",
      };
    }

    const googleRes = await oauth2client.getToken(code);

    oauth2client.setCredentials(googleRes.tokens);

    const tokens = googleRes.tokens;

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { name, email } = userRes.data;

    let user = await userRepository.findByEmail(email);

    let isFirstTime = false;

    if (!user) {
      isFirstTime = true;

      user = await userRepository.create({
        name,
        email,
        provider: "google",
        isVerified: true,
      });
    }

    const jwtToken = tokenService.generateAccessToken(user);

    if (isFirstTime) {
      await addEmailJob({
        type: "welcome",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    }

    return {
      statusCode: 200,
      success: true,
      message: "Login successful",
      token: jwtToken,
      email,
      name: user.name,
    };
  }
}

export default new OAuthService();
