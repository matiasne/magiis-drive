import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { ICommandParameters } from "./iCommandParameters";
import { EndPointEnum } from "./endPointEnum.enum";
import { IRequestCommand } from "./iRequestCommand";
import { ICommandResponse } from "./iCommandResponse";
import { CommandRequestType } from "./commandRequestType";
import { AppSettings, URL } from "../app-settings";
import { ErrorMessage } from "../common/errorMessage";
import { TranslateService } from "@ngx-translate/core";
import { timeout, map } from 'rxjs/operators';

@Injectable({providedIn:'root'})
export class ConnectionServices {
    private apiUrl: string;
    private _token: string = '';
    private _LogUserId: string = '';
    private timeOut: number = 75000;

    constructor(
        private http: HttpClient,
     //   public events: Events,
        private translateService: TranslateService,
    ) {
        this.apiUrl = this.getUrl();
    }

    public setToken(token: string) {
        this._token = token;
    }

    public getToken() {
        return this._token;
    }

    public setLogUserId(logUserId: string) {
        this._LogUserId = logUserId;
    }

    public getLogUserId() {
        return this._LogUserId;
    }

    getUrl() {
        let url;
        if (AppSettings.ENVIROMENT_SELECTION_ENABLED && URL.value != "") {
            url = URL.value;
        } else {
            url = AppSettings.Url
        }
        return url;
    }

    public Request<TReturnData extends ICommandResponse, TCommandParameters extends ICommandParameters>(command: IRequestCommand<TReturnData, HttpErrorContainer, TCommandParameters>): Promise<any> {
        if (command.endPointType === EndPointEnum.MagiisApi) {
            this.apiUrl = this.getUrl();
        }
        if (command.endPointType === EndPointEnum.TraslatorApi) {
            this.apiUrl = this.getUrl();
        }

        return new Promise((resolve, reject) => {
            if (command.commandType === CommandRequestType.POST) {
                this.post<TReturnData, HttpErrorContainer, TCommandParameters>(command).then(response => {
                    resolve(response);
                }).catch((error: ErrorMessage) => {
                    reject(error);
                });
            } else if (command.commandType === CommandRequestType.GET) {
                this.get<TReturnData, HttpErrorContainer, TCommandParameters>(command).then(response => {
                    resolve(response);
                }).catch((error: ErrorMessage) => {
                    reject(error);
                });
            } else if (command.commandType === CommandRequestType.PUT) {
                this.put<TReturnData, HttpErrorContainer, TCommandParameters>(command).then(response => {
                    resolve(response);
                }).catch((error: ErrorMessage) => {
                    reject(error);
                });
            } else if (command.commandType === CommandRequestType.DELETE) {
                this.delete<TReturnData, HttpErrorContainer, TCommandParameters>(command).then(response => {
                    resolve(response);
                }).catch((error: ErrorMessage) => {
                    reject(error);
                });
            }
        });
    }

    private composeUri(commandUrl: string): string {
        return `${this.apiUrl}${commandUrl}`;
    }

    // tslint:disable-next-line:max-line-length
    private get<TReturnData extends ICommandResponse, TError, TCommandParameters extends ICommandParameters>(command: IRequestCommand<TReturnData, TError, TCommandParameters>): Promise<TReturnData> {
        const options = this.setOptions(command);

        return new Promise((resolve, reject) => {
            this.http.get<TReturnData>(this.composeUri(command.commandUrl), options).pipe(timeout(this.timeOut)).subscribe(response => {
                resolve(response);
            }, (error: HttpErrorResponse) => {
                reject(this.getMessageError(error));
            });
        });
        //return this.http.get<TReturnData>(this.apiUrl + command.commandUrl, options).toPromise();
    }
    private post<TReturnData extends ICommandResponse, TError, TCommandParameters extends ICommandParameters>(command: IRequestCommand<TReturnData, TError, TCommandParameters>): Promise<TReturnData> {
        const options = this.setOptions(command);

        // TODO: Refactor: Need to make a generic call
        if (command.responseContentType === 2) {
            // This method uses for download file
            ; (<any>options).responseType = "blob"
            const arrayBufferResponse = <any>this.http.post(this.apiUrl + command.commandUrl, command.commandBody, options)
            return arrayBufferResponse
        } else {

            return new Promise((resolve, reject) => {
                this.http.post<TReturnData>(this.composeUri(command.commandUrl), command.commandBody, options).pipe(timeout(this.timeOut)).subscribe(response => {
                    resolve(response);
                }, (error: HttpErrorResponse) => {
                    reject(this.getMessageError(error));
                });
            });

           // return this.http.post<TReturnData>(this.apiUrl + command.commandUrl, command.commandBody, options).toPromise();
        }
    }
    private put<TReturnData extends ICommandResponse, TError, TCommandParameters extends ICommandParameters>(command: IRequestCommand<TReturnData, TError, TCommandParameters>): Promise<TReturnData> {
        const options = this.setOptions(command);

        return new Promise((resolve, reject) => {
            this.http.put<TReturnData>(this.composeUri(command.commandUrl), command.commandBody, options).pipe(timeout(this.timeOut)).subscribe(response => {
                resolve(response);
            }, (error: HttpErrorResponse) => {
                reject(this.getMessageError(error));
            });
        });

        //return this.http.put<TReturnData>(this.apiUrl + command.commandUrl, command.commandBody, options).toPromise();
    }
    private delete<TReturnData extends ICommandResponse, TError, TCommandParameters extends ICommandParameters>(command: IRequestCommand<TReturnData, TError, TCommandParameters>): Promise<TReturnData> {
        // const options = this.setOptions(command);

        return new Promise((resolve, reject) => {
            this.http.delete<TReturnData>(this.apiUrl + command.commandUrl, command.commandBody).pipe(timeout(this.timeOut)).subscribe(response => {
                resolve(response);
            }, (error: HttpErrorResponse) => {
                reject(this.getMessageError(error));
            });
        });

        //return this.http.delete<TReturnData>(this.apiUrl + command.commandUrl, command.commandBody).toPromise();
    }


    private getMessageError(error: HttpErrorResponse){
        let errorMessage: string;

        if(error.statusText == "TimeoutError") {
            return new ErrorMessage(this.translateService.instant('connection_service.timeout_error'), -1);
        }

        switch (error.status) {
            case 0:
                errorMessage = this.translateService.instant("connection_service.error_0");
                break;

            case 401:
                if (error.error != null && error.error.error == "Unauthorized"){
                    errorMessage = this.translateService.instant('connection_service.error_401_session');
                 //   this.events.publish('OLD_TOKEN');
                }else{
                    errorMessage = this.translateService.instant('connection_service.error_401');
                }
                break;
            case 403:
                errorMessage = this.translateService.instant("connection_service.error_403");
                break;
            // case 400:
            //     if(error.error != null){

            //     }
            //     console.log("error:", error);
            //     errorMessage = this.translateService.instant("connection_service.error_400");
            //     break;
            case 402:
            case 404:
                if (error.error != null && error.error !== undefined) {
                    errorMessage = error.error.description;
                }else{
                    errorMessage = error.message;
                }
                break;

            case 500:
                errorMessage = this.translateService.instant("connection_service.error_500");

                break;

            case 406:
              if (error.error.errorCode === 'INVALID_ROUTE') {
                errorMessage = error.error.description;
                break;
              }

            case 409:
                console.log(error);
                if(error.error.errorCode=='DRIVER_CONCURRENCY'){
                    errorMessage = error.error.description;
                }else{
                    errorMessage = error.error.errorCode;
                }
                break;

            default:
                console.log(error)
                if (error.error != null && error.error !== undefined) {
                    console.log("error.error.errorCode", error.error.errorCode);
                //    errorMessage = this.translateService.instant(error.error.errorCode);//ACTION_NOT_ALLOWED
                } else {
                    errorMessage = error.message;
                }

                //errorMessage = error.message;
                break;
        }

        if (errorMessage === undefined){
            errorMessage = this.translateService.instant("connection_service.error_500");
        }

        return new ErrorMessage(errorMessage, error.status);
    }

    // Set options in header and other parametter to require for the request
    // tslint:disable-next-line:max-line-length
    private setOptions<TReturnData extends ICommandResponse, TError, TCommandParameters extends ICommandParameters>(command: IRequestCommand<TReturnData, TError, TCommandParameters>) {
        let headersAppend = new HttpHeaders()
        if (command.canAddCustomHeaders && command.replaceDefaultHeader) {
            // need to replace all header for the custom
            for (const item of command.customHeader) {
                headersAppend = headersAppend.append(item.name, item.value)
            }
            // tslint:disable-next-line:no-shadowed-variable
            const options = {
                headers: headersAppend
            }
            return options
        } else {
            if (command.canAddCustomHeaders && !command.replaceDefaultHeader) {
                // add custom header to the default header
                for (const item of command.customHeader) {
                    headersAppend = headersAppend.append(item.name, item.value)
                }
            }
        }
        // TODO: Need to use the parameter
        // if (command.responseContentType == ResponseContentType.Blob)
        //     headersAppend = headersAppend.append('responseType', 'blob');
        // else
        //     headersAppend = headersAppend.append('Content-Type', command.requestContentTypeƒ);

        if (command.needAuthenticate) {
            headersAppend = headersAppend.append("Authorization", `Bearer ${this._token}`)
        }

        const options = {
            headers: headersAppend
        }

        return options
    }
}

export class EndPointUrl {
    static login = "/login"
}

// tslint:disable-next-line:no-empty-interface
interface HttpErrorContainer { }
