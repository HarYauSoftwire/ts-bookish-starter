import express from 'express';
import 'dotenv/config';

import healthcheckRoutes from './controllers/healthcheckController';
import loginRoutes from './controllers/loginController';
import bookRoutes from './controllers/bookController';
import userRoutes from './controllers/userController';
import searchRoutes from './controllers/searchController';
import borrowRoutes from './controllers/borrowController';

const port = process.env['PORT'] || 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

/**
 * Primary app routes.
 */
app.use('/healthcheck', healthcheckRoutes);
app.use('/login', loginRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/search', searchRoutes);
app.use('/borrow', borrowRoutes);
