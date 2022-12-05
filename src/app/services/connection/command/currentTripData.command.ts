import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';
import { CurrentTravelModel } from '../../../models/current-travel.model';

export class CurrentTripDataCommand extends IRequestCommand<ICurrentTripDataResponse, ErrorDetails, ICurrentTripDataCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/current/{driverId}';
    public setParameters(parameters: ICurrentTripDataCommandParameters) {
        this._commandUrl = this._commandUrl
        .replace('{carrierUserId}', parameters.carrierUserId.toString())
        .replace('{travelId}', parameters.travelId.toString())
        .replace('{driverId}', parameters.driverId.toString());
        this._commandBody = parameters;
    };
}

export interface ICurrentTripDataCommandParameters extends ICommandParameters {
    carrierUserId: number;
    travelId: number;
    driverId: number;
}

export interface ICurrentTripDataResponse extends ICommandResponse {
        currentTrip: CurrentTravelModel;
}
