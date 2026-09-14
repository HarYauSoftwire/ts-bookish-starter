import { Router, Request, Response } from 'express';

import sql from '../db';

class SearchController {
    router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/title/:query', this.searchTitle.bind(this));
    }

    async searchTitle(req: Request, res: Response) {
        const query = req.params.query;
        if (typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'query is required and must be a non-empty string.',
            });
        }
        const books = await sql`
            SELECT * FROM Books WHERE Title LIKE ${ '%' + query + '%' };
        `;
        if (books.length > 0) {
            return res.status(200).json(books);
        } else {
            return res.status(404).json({
                error: 'not_found',
                error_description: 'No books found.',
            });
        }
    }
}

export default new SearchController().router;
