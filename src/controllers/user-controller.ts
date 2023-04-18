import { User } from '../models/user';
import { DbController } from './db-controller';

export class UserController {

    private insertString: string = "INSERT INTO user (email, businessOwner, hash) VALUES ($email, $businessOwner, $hash);";
    private findString: string = "SELECT * FROM user WHERE email='$email';";
    private removeString: string = "DELETE FROM user WHERE id=$id;";

    public static addNewUser(): User {
        // validate information given
        // if valid, add user to database
        // if not valid, do something else
        return new User();
    }
    
    public static findUser(email: string): User {
        
        // do database stuff to find the user and their hash
        
        return new User();
    }
    
    public static  generateUserHash(pw: string) {
        const padPw: string = `${pw}${process.env.PADDING}`.substring(0, 20);
        const preHash: string = `${process.env.SALT}${padPw}${process.env.SALT2}`;
        const postHash: string = Buffer.from(preHash, 'binary').toString('base64');
        return postHash;
    }

    public static removeUser() {
        // verify the user is in the database
        // remove the user from the database
    }
}

