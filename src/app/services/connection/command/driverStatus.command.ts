import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class DriverStatusCommand extends IRequestCommand<IDriverStatusResponse, ErrorDetails, IDriverStatusCommandParameters> {
        _commandType: CommandRequestType = CommandRequestType.GET;
        _commandUrl = 'carriers/{carrierId}/drivers/{driverId}/status';
        public setParameters(parameters: IDriverStatusCommandParameters) {
            this._commandUrl = this._commandUrl.replace('{driverId}', parameters.driverId.toString());
            this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
        };
}

export interface IDriverStatusCommandParameters extends ICommandParameters {
        driverId: number;
        carrierId: number,
}

export interface IDriverStatusResponse extends ICommandResponse {
    
}