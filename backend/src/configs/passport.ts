import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import passport from 'passport';
import { User } from '../models/index.js';
import { UserInstance } from '../types/models.js';
import 'dotenv/config';

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
};

passport.use(
  new JwtStrategy(options, async (payload: any, done: any) => {
    try {
      const user = (await User.findByPk(payload.id)) as UserInstance | null;
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }),
);

export default passport;

