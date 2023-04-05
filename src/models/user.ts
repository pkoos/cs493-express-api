export class User {
    id: number;
    email: string;
    private hash: string;
    private type: string;

    constructor(id: number, email: string, password: string, type: string) {
        this.id = id;
        this.email = email;
        this.hash = this.generateUserHash(id, email, password);
        this.type = type;
    }

    private generateUserHash(id: number, email: string, pw: string) {
        return `${id.toString()}${email}${pw}`;
    }
}