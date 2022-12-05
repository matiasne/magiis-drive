import { ICommandParameters } from './iCommandParameters';
import { RequestContentTypeEnum } from './requestContentTypeEnum.enum';
import { RequestHeader } from './requestHeader';
import { EndPointEnum } from './endPointEnum.enum';
import { CommandRequestType } from './commandRequestType';
import { ICommandResponse } from './iCommandResponse';


export abstract class IRequestCommand<TReturnData extends ICommandResponse, TError, TCommandParameters extends ICommandParameters> {
    // This property decide if the service send the token in the header
    public _needAuthenticate = true;
    get needAuthenticate(): boolean {
        return this._needAuthenticate;
    }
    // This property set the type of file that the service return
    protected _responseContentType: number = 1;
    get responseContentType(): number {
        return this._responseContentType;
    }


    private _responseType: TReturnData;
    get responseType(): TReturnData {
        return this._responseType;
    }
    private _errorType: TError;
    get errorType(): TError {
        return this._errorType;
    }
    // abstract commandType: commandRequestType;
    // Parameter that you want to send inside of the body
    protected _commandType: CommandRequestType;
    get commandType(): CommandRequestType {
        return this._commandType;
    }
    // Url the api to send a request
    protected _commandUrl: string;
    get commandUrl(): string {
        return this._commandUrl;
    }

    // Parameter that you want to send inside of the body
    protected _commandBody: TCommandParameters;
    get commandBody(): TCommandParameters {
        return this._commandBody;
    }
    // Set the different type Of EndPoint
    protected _endPointType: EndPointEnum = EndPointEnum.MagiisApi;
    get endPointType(): EndPointEnum {
        return this._endPointType;
    }
    // Indicate what type of content send in the request
    // Send Json by Default
    protected _requestContentType: RequestContentTypeEnum = RequestContentTypeEnum.JSON;
    get requestContentType(): RequestContentTypeEnum {
        return this._requestContentType;
    }
    // Set the parameter that the class will send to the service
    // Need to use the class that comes for the Api Interface
    // This interface generate by the backend
    public setParameters(parameters: TCommandParameters) {
        this._commandBody = parameters;
    }

    // List of customHeader
    // tslint:disable-next-line:member-ordering
    protected _customHeader: Array<RequestHeader> = new Array<RequestHeader>();
    get customHeader(): Array<RequestHeader> {
        return this._customHeader;
    }
    // canAddCustomHeaders: True : Can to add custom headers
    // canAddCustomHeaders: False: Can't to add custom headers
    // tslint:disable-next-line:member-ordering
    protected _canAddCustomHeaders = false;
    public get canAddCustomHeaders(): boolean {
        return this._canAddCustomHeaders;
    }
    // replaceDefaultHeader: True : Indicate that this header  will override the default Header
    // replaceDefaultHeader: False:Indicate that this headers, will send with the default header (token, and type)
    // tslint:disable-next-line:member-ordering
    protected _replaceDefaultHeader = false;
    public get replaceDefaultHeader(): boolean {
        return this._replaceDefaultHeader;
    }
    // header: List of header for send in the request
    // be careful because, of this parameter is true, you are going to lost the default header like as token token bearer
    addCustomHeaders(headers: Array<RequestHeader>) {
        if (!this._canAddCustomHeaders) {
            throw new Error('You can\'t add custom headers, because the property customHeaders is false');
        }
        if (headers == null && headers.length <= 0) {
            throw new Error('Headers have a erro!!');
        }

        this._customHeader = new Array<RequestHeader>();
        for (const item of headers) {
            this._customHeader.push(item);
        }
    }
}
