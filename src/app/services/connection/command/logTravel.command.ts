import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class LogTravelCommand extends IRequestCommand<ILogTravelResponse, ErrorDetails, ILogTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/drivers/driverLogs';
    public setParameters(parameters: ILogTravelCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandBody = parameters;
    };
}

export interface ILogTravelCommandParameters extends ICommandParameters {
    travelId: number;           // TravelID.
    carrierUserId: number;      // CarrierID.
    driverId: number;           // DriverID
    dataLog: string;            // Dato a Loguear
}

export interface ILogTravelResponse extends ICommandResponse {

}
