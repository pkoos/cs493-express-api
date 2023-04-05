export class User {
    id: number;
    email: string;
    private hash: string;
    private type: string;

    constructor(id: number, email: string, password: string, type: string) {
        this.id = id;
        this.email = email;
        this.hash = this.generateUserHash(password);
        this.type = type;
    }

    private generateUserHash(pw: string) {
        const padPw: string = `${pw}${process.env.PADDING}`.substring(0, 20);
        const preHash: string = `${process.env.SALT}${padPw}${process.env.SALT2}`;
        const postHash: string = Buffer.from(preHash, 'binary').toString('base64');
        return postHash;
    }

    public toString() {
        return `User: { id: ${this.id}, email: ${this.email}, hash: ${this.hash}, type: ${this.type}}`
    }
}