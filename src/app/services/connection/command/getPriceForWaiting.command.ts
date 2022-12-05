import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, PriceForWaitingResponse } from '../interfaces/apiInterfaces';

export class PriceForWaitCommand extends IRequestCommand<IPriceForWaitResponse, ErrorDetails, IPriceForWaitCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'priceParameters/delayTime/{minutes}/mailDriver/{email}';
    public setParameters(parameters: IPriceForWaitCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{minutes}', parameters.minutes.toString());
        this._commandUrl = this._commandUrl.replace('{email}', parameters.emailDriver.toString());
        this._commandBody = parameters;
    };
}

export interface IPriceForWaitCommandParameters extends ICommandParameters {
    minutes: number;
    emailDriver: string;
}

export interface IPriceForWaitResponse extends ICommandResponse, PriceForWaitingResponse {
    price: number;
}
