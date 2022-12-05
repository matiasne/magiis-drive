import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class GetDriverCommand extends IRequestCommand<IGetDriverResponse, ErrorDetails, IGetDriverCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'drivers/basicInfo/{driverUserId}';
    public setParameters(parameters: IGetDriverCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{driverUserId}', parameters.driverUserId.toString());
    };
}

export interface IGetDriverCommandParameters extends ICommandParameters {
    driverUserId: string;
}

export interface IGetDriverResponse extends ICommandResponse {
    username: string;
}
