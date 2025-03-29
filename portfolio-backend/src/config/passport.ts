import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model';
import env from './env';

const { JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = env;

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID!,
            clientSecret: GOOGLE_CLIENT_SECRET!,
            callbackURL: GOOGLE_CALLBACK_URL!,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails?.[0].value });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails?.[0].value,
                        googleId: profile.id,
                        isVerified: true, // Google verified emails
                    });
                } else if (!user.googleId) {
                    user.googleId = profile.id;
                    user.isVerified = true;
                    await user.save();
                }

                done(null, user);
            } catch (err) {
                done(err as Error, undefined);
            }
        }
    )
);

// JWT Strategy
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET!,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.id).select(
                    '-password -verificationToken -passwordResetToken -passwordResetExpires'
                );

                if (!user) {
                    return done(null, false);
                }

                done(null, user);
            } catch (err) {
                done(err, false);
            }
        }
    )
);

export default passport;
