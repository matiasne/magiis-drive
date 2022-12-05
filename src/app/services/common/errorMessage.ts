export class ErrorMessage {
    message: string = '';
    status: number = 0;

    constructor(message: string, status: number){
        this.message = message;
        this.status = status;
    }
}