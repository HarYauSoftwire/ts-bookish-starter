import { Router, Request, Response } from 'express';

import sql from '../db';

class BorrowController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.post('/', this.createBorrow.bind(this));
        this.router.patch('/:borrowId', this.returnBorrow.bind(this));
    }

    async createBorrow(req: Request, res: Response) {
        const { userId, bookId } = req.body;

        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId)) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'userId is required and must be an integer.',
            });
        }

        const userExists = await sql`SELECT 1 FROM Users WHERE UserId = ${ parsedUserId }`;
        if (userExists.length === 0) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'userId does not reference an existing user.',
            });
        }

        const parsedBookId = Number(bookId);
        if (!Number.isInteger(parsedBookId)) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'bookId is required and must be an integer.',
            });
        }

        const bookExists = await sql`SELECT 1 FROM Books WHERE BookId = ${ parsedBookId }`;
        if (bookExists.length === 0) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'bookId does not reference an existing book.',
            });
        }

        // due date is 6 weeks after today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 42);
        const fullDueDateString = dueDate.toISOString();
        const dueDateStringMatch = /^(.*)T/.exec(fullDueDateString);
        if (!dueDateStringMatch) {
            return res.status(500).json({
                error: 'server_error',
                error_description: 'Error getting current date.',
            });
        }
        const dueDateString = dueDateStringMatch[1];


        const borrow = await sql`
            INSERT INTO Borrows
                (UserId, BookId, DueDate, Returned)
            VALUES
                (${ parsedUserId }, ${ parsedBookId }, ${ dueDateString }, ${ false })
            RETURNING *;
        `;
        return res.status(201).json(borrow)

    }

    async returnBorrow(req: Request<{ borrowId: string }>, res: Response) {
        const { borrowId } = req.params;

        const parsedBorrowId = Number(borrowId);
        if (!Number.isInteger(parsedBorrowId)) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'borrowId is required and must be an integer.',
            });
        }

        const borrowExists = await sql`SELECT 1 FROM Borrows WHERE BorrowId = ${ parsedBorrowId }`;
        if (borrowExists.length === 0) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'borrowId does not reference an existing borrow.',
            });
        }

        const borrow = await sql`
            UPDATE Borrows
            SET Returned = ${ true }
            WHERE BorrowId = ${ parsedBorrowId }
            RETURNING (Returned);
        `;
        return res.status(200).json(borrow)

    }
}

export default new BorrowController().router;
