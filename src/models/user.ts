import { UserController } from '../controllers/user-controller';
export class User {
    id: number;
    email: string;
    hash: string;
    businessOwner: boolean;

    constructor(id: number = 0, email: string = "", hash: string = "", businessOwner: boolean = false) {
        this.id = id;
        this.email = email;
        this.hash = hash;
        this.businessOwner = businessOwner;
    }

    public toString() {
        return `User: { id: ${this.id}, email: ${this.email}, hash: ${this.hash}, businessOwner: ${this.businessOwner}}`
    }
}
