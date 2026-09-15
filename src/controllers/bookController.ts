import { Router, Request, Response } from 'express';

import sql from '../db';

class BookController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/', this.getAllBooks.bind(this));
        this.router.get('/:id', this.getBook.bind(this));

        this.router.post('/', this.createBook.bind(this));
    }

    async getAllBooks(req: Request, res: Response) {
        const books = await sql`
            SELECT * FROM Books;
        `
        return res.status(200).json(books);
    }

    async getBook(req: Request, res: Response) {
        const parsedId = Number(req.params.id);
        if (!Number.isInteger(parsedId) || parsedId < 0) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'id is required and must be a non-negative integer.',
            });
        }
        const book = await sql`
            SELECT * FROM Books WHERE BookId = ${ req.params.id };
        `
        if (book.length == 1) {
            return res.status(200).json(book[0]);
        } else {
            return res.status(404).json({
                error: 'not_found',
                error_description: 'No book found with the given id.',
            });
        }
    }

    async createBook(req: Request, res: Response) {
        const { title, author, isbn, copies } = req.body;

        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'title is required and must be a non-empty string.',
            });
        }
        if (title.length > 255) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'title must be at most 255 characters long.',
            });
        }

        if (typeof author !== 'string' || author.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'author is required and must be a non-empty string.',
            });
        }
        if (author.length > 255) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'author must be at most 255 characters long.',
            });
        }

        if (typeof isbn !== 'string' || isbn.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'isbn is required and must be a non-empty string.',
            });
        }
        if (isbn.length > 255) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'isbn must be at most 255 characters long.',
            });
        }

        const parsedCopies = Number(copies);
        if (!Number.isInteger(parsedCopies) || parsedCopies < 0) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'copies is required and must be a non-negative integer.',
            });
        }

        const book = await sql`
            INSERT INTO Books
                (Title, Author, ISBN, Copies)
            VALUES
                (${ title },  ${ author }, ${ isbn }, ${ parsedCopies })
            RETURNING *;
        `;
        return res.status(201).json(book)
    }
}

export default new BookController().router;
