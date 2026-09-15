import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import sql from '../db';
import secret from '../secret';

class LoginController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/:username/:password', this.login.bind(this));
    }

    async login(req: Request<{ username: string, password: string }>, res: Response) {
        const { username, password } = req.params;
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
