import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class UpdateDriverCommand extends IRequestCommand<IUpdateDriverResponse, ErrorDetails, IUpdateDriverCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.PUT;
    _commandUrl = 'drivers/{driverUserId}/updateImage';
    public setParameters(parameters: IUpdateDriverCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{driverUserId}', parameters.driverUserId.toString());
        this._commandBody = parameters;
    };
}

export interface IUpdateDriverCommandParameters extends ICommandParameters {
        driverUserId: number;
        newImage: string;
}

export interface IUpdateDriverResponse extends ICommandResponse {

}