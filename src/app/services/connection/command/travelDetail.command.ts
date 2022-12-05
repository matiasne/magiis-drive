import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class TravelDetailCommand extends IRequestCommand<ITravelDetailResponse, ErrorDetails, ITravelDetailCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}';
    public setParameters(parameters: ITravelDetailCommandParameters) {
        this._commandUrl = this._commandUrl
        .replace('{carrierUserId}', parameters.carrierUserId.toString())
        .replace('{travelId}', parameters.travelId.toString())
        this._commandBody = parameters;
    };
}

export interface ITravelDetailCommandParameters extends ICommandParameters {
    carrierUserId: number;
    travelId: number;
}

export interface ITravelDetailResponse extends ICommandResponse {
    
}