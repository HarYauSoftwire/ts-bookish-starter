import { Router, Request, Response } from 'express';

import sql from '../db';

class UserController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.post('/', this.createUser.bind(this));
    }

    async createUser(req: Request, res: Response) {
        const { username } = req.body;

        if (typeof username !== 'string' || username.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'name is required and must be a non-empty string.',
            });
        }
        if (username.length > 255) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'name must be at most 255 characters long.',
            });
        }

        const user = await sql`
            INSERT INTO Users
                (UserName)
            VALUES
                (${ username })
            RETURNING *;
        `;
        return res.status(201).json(user)

    }
}

export default new UserController().router;
