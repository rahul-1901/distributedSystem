import express from 'express'
import axios from 'axios'

export const githubAuthLogin = async (req, res) => {
  try {
    const { code, state } = req.query
    
    if (!code) {
      return res.status(400).json({ message: "Missing authorization code from GitHub OAuth" });
    }

    // Verify state parameter to prevent CSRF attacks (if you're using it)
    // if (state !== req.session.githubState) {
    //   return res.status(400).json({ message: "Invalid state parameter" });
    // }

    // Fix the query parameter formatting
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    });

    const response = await axios.post(
      "https://github.com/login/oauth/access_token", 
      params,
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token, token_type, error, error_description } = response.data;

    if (error) {
      console.error('GitHub OAuth error:', error_description);
      return res.status(400).json({ 
        message: "GitHub OAuth error", 
        error: error_description 
      });
    }

    if (!access_token) {
      return res.status(400).json({ message: "GitHub access token not found" });
    }

    // Get user info from GitHub to verify token
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { 
        Authorization: `${token_type || 'token'} ${access_token}`,
        "User-Agent": "YourAppName" // GitHub requires a User-Agent header
      },
    });

    // Save token and GitHub user info for logged-in user
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        gitHubAccessToken: access_token,
        isGitHubLoggedIn: true,
        gitHubUserId: userResponse.data.id,
        gitHubUsername: userResponse.data.login,
        // Optionally store other GitHub user data
        gitHubEmail: userResponse.data.email,
        gitHubName: userResponse.data.name,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      message: "GitHub linked successfully",
      githubUser: {
        login: userResponse.data.login,
        name: userResponse.data.name,
        avatar_url: userResponse.data.avatar_url
      }
    });

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    
    // Handle specific axios errors
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        return res.status(401).json({ message: "Invalid GitHub credentials" });
      } else if (status === 403) {
        return res.status(403).json({ message: "GitHub API rate limit exceeded" });
      }
    }

    return res.status(500).json({
      message: "Internal server error during GitHub authentication",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export const githubTokenExchange = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    
    if (!user || !user.gitHubAccessToken) {
      return res.status(400).json({ message: "GitHub not connected" });
    }

    const response = await axios.get("https://api.github.com/user", {
      headers: { 
        Authorization: `token ${user.gitHubAccessToken}`,
        "User-Agent": "YourAppName" // GitHub requires a User-Agent header
      },
    });

    // Update user's GitHub info in case it changed
    await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        gitHubUsername: response.data.login,
        gitHubEmail: response.data.email,
        gitHubName: response.data.name,
        lastGitHubSync: new Date()
      }
    );

    return res.status(200).json({ 
      userData: {
        id: response.data.id,
        login: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
        bio: response.data.bio,
        public_repos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
        created_at: response.data.created_at
      }
    });

  } catch (error) {
    console.error('GitHub token exchange error:', error);
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        // Token is invalid or expired, clear it from user record
        await UserModel.findByIdAndUpdate(
          req.user.id,
          {
            $unset: { gitHubAccessToken: 1 },
            isGitHubLoggedIn: false
          }
        );
        
        return res.status(401).json({ 
          message: "GitHub token invalid or expired. Please reconnect your GitHub account." 
        });
      } else if (status === 403) {
        return res.status(403).json({ message: "GitHub API rate limit exceeded" });
      }
    }

    return res.status(500).json({ 
      message: "Internal server error during GitHub token validation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional helper function for disconnecting GitHub
export const githubDisconnect = async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        $unset: { 
          gitHubAccessToken: 1,
          gitHubUserId: 1,
          gitHubUsername: 1,
          gitHubEmail: 1,
          gitHubName: 1
        },
        isGitHubLoggedIn: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "GitHub disconnected successfully" });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    return res.status(500).json({ 
      message: "Internal server error during GitHub disconnection" 
    });
  }
};