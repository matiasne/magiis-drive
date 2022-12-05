import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class AddAdditionalsInTravelCommand extends IRequestCommand<IAddAdditionalsInTravelResponse, ErrorDetails, IAddAdditionalsInTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/calculateCost';
    public setParameters(parameters: IAddAdditionalsInTravelCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandBody = parameters;
    };
}

export interface IAddAdditionalsInTravelCommandParameters extends ICommandParameters {
    travelId: number;
    carrierUserId: number;
    tollPrice: number;
    additionalStop: number;
    waitTime: number;
    parking: number;
    finalKm: number;
}

export interface IAddAdditionalsInTravelResponse extends ICommandResponse {
    finalPrice: number;
}
