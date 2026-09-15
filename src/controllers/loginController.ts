import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import sql from '../db';
import secret from '../secret';

class LoginController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.post('/', this.login.bind(this));
    }

    async login(req: Request, res: Response) {
        const { username, password } = req.body;

        if (typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'username is required and must be a non-empty string.',
            });
        }
        if (username.length > 255) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'username must be at most 255 characters long.',
            });
        }

        if (typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'password is required and must be a non-empty string.',
            });
        }
        if (password.length > 255) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'password must be at most 255 characters long.',
            });
        }

        const dbUser = await sql`
            SELECT UserName FROM DBUsers WHERE UserName = ${ username } AND UserPassword = ${ password };
        `
        if (dbUser.length == 1) {
            const token = jwt.sign(dbUser[0], secret);
            return res.status(200).send(token);
        } else {
            return res.status(400).json({
                error: 'login_fail',
                error_description: 'Username or password is incorrect.',
            });
        }
    }
}

export default new LoginController().router;
