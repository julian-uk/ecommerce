import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel from '../models/user.js'; // Your existing user model
import 'dotenv/config';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/google/callback", // Must be absolute
    passReqToCallback: true
  },
  // ... strategy logic

  
  // Inside your Passport Strategy
    async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // 1. Try finding by Google ID first
      let user = await userModel.findByGoogleId(profile.id);
      
      // 2. If not found, try finding by email
      if (!user) {
        user = await userModel.findByEmail(email);
        
        if (user) {
          // User exists (signed up via form), link their Google ID
          // You would need an 'update' method for this
          await userModel.linkGoogleAccount(user.id, profile.id);
        } else {
          // 3. New User: Create them
          user = await userModel.createGoogleUser({
            username: profile.displayName,
            email: email,
            google_id: profile.id,
            profile_pic: profile.photos[0].value
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));