import { Router, Request, Response } from 'express';

import sql from '../db';

class UserController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/search/:query', this.searchUser.bind(this));
        this.router.get('/:userId', this.listUserBorrows.bind(this));
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

    async searchUser(req: Request<{ query: string }>, res: Response) {
        const query = req.params.query;
        if (typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'query is required and must be a non-empty string.',
            });
        }
        const users = await sql`
            SELECT * FROM Users WHERE UserName LIKE ${ '%' + query + '%' };
        `;
        if (users.length > 0) {
            return res.status(200).json(users);
        } else {
            return res.status(404).json({
                error: 'not_found',
                error_description: 'No users found.',
            });
        }
    }

    async listUserBorrows(req: Request<{ userId: string }>, res: Response) {
        const { userId } = req.params;

        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId)) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'userId is required and must be an integer.',
            });
        }

        const userExists = await sql`SELECT 1 FROM Borrows WHERE BorrowId = ${ parsedUserId }`;
        if (userExists.length === 0) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'userId does not reference an existing user.',
            });
        }

        const borrows = await sql`
            SELECT
            Borrows.BorrowId as BorrowId, Books.Title as Title, Books.Author as Author, Books.ISBN as ISBN, Borrows.DueDate as DueDate
            FROM Borrows INNER JOIN Books
            ON Borrows.BookId = Books.BookId
            WHERE Borrows.UserId = ${ userId }
            AND Borrows.Returned = ${ false };
        `
        return res.status(200).json(borrows);
    }
}

export default new UserController().router;
