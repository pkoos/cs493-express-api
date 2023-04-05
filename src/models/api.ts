export class Api {
    private static readonly _version: string = 'v1';
    private static readonly _basePath: string = `/api/${this._version}`;
    private static readonly _businessPath: string = `${this._basePath}/business`;
    private static readonly _userPath: string = `${this._basePath}/user`;
    private static readonly _photoPath: string = `${this._basePath}/photo`;
    private static readonly _reviewPath: string = `${this._basePath}/review`;
    
    public static readonly BusinessPath: string = this._businessPath;
    public static readonly UserPath: string = this._userPath;
    public static readonly PhotoPath: string = this._photoPath;
    public static readonly ReviewPath: string = this._reviewPath;
}
