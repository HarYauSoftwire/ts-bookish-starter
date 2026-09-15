import express from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import 'dotenv/config';

import secret from './secret';
import healthcheckRoutes from './controllers/healthcheckController';
import loginRoutes from './controllers/loginController';
import bookRoutes from './controllers/bookController';
import userRoutes from './controllers/userController';
import searchRoutes from './controllers/searchController';
import borrowRoutes from './controllers/borrowController';

const port = process.env['PORT'] || 3000;

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret,
    },
    function (jwt_payload, done) {
        console.log(jwt_payload);
        const user = jwt_payload.username;
        return done(null, user);
    }
))

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

/**
 * Primary app routes.
 */
app.use('/healthcheck', healthcheckRoutes);
app.use('/login', loginRoutes);
app.use('/books', passport.authenticate('jwt', { session: false }), bookRoutes);
app.use('/users', passport.authenticate('jwt', { session: false }), userRoutes);
app.use('/search', passport.authenticate('jwt', { session: false }), searchRoutes);
app.use('/borrow', passport.authenticate('jwt', { session: false }), borrowRoutes);
