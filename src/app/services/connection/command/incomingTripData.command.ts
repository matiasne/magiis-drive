import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class IncomingTripDataCommand extends IRequestCommand<IIncomingTripDataResponse, ErrorDetails, IIncomingTripDataCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierId}/travels/{travelId}/incoming/{driverId}';
    //carriers/:carrierId/travels/:travelId/incoming/:driverId
    public setParameters(parameters: IIncomingTripDataCommandParameters) {
        this._commandUrl = this._commandUrl
        .replace('{carrierId}', parameters.carrierId.toString())
        .replace('{travelId}', parameters.travelId.toString())
        .replace('{driverId}', parameters.driverId.toString());
        this._commandBody = parameters;
    };
}

export interface IIncomingTripDataCommandParameters extends ICommandParameters {
    carrierId: number;
    travelId: number;
    driverId: number;
}

export interface IIncomingTripDataResponse extends ICommandResponse {
    //incomingTrip: TravelConfirmModel;
}
