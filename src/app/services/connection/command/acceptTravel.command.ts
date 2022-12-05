import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class AcceptTravelCommand extends IRequestCommand<IAcceptTravelResponse, ErrorDetails, IAcceptTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/accept';
    public setParameters(parameters: IAcceptTravelCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString()).replace('{travelId}', parameters.travelId.toString());
        this._commandBody = parameters;
    };
}

export interface IAcceptTravelCommandParameters extends ICommandParameters {
    driverUserId: string;
    travelId: number;
    carrierUserId: string;
}

export interface IAcceptTravelResponse extends ICommandResponse {

}