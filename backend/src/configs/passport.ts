import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import passport from 'passport';
import { User } from '../models/index.js';
import 'dotenv/config';

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'secret',
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    console.log('JWT payload:', payload);
    try {
      const user = await User.findByPk(payload.id);
      if (user) {
        console.log('User found:', user.email);
        return done(null, user);
      }
      console.log('User not found');
      return done(null, false);
    } catch (error) {
      console.error('Error in JWT strategy:', error);
      return done(error, false);
    }
  }),
);


export default passport;
