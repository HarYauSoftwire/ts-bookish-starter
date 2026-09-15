import 'dotenv/config';
const secretUndef = process.env["SECRET"];
if (!secretUndef) {
    throw new Error("Secret not found in .env!");
}

const secret: string = secretUndef;

export default secret;