import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class ArriveToDestinationCommand extends IRequestCommand<IArriveToDestinationResponse, ErrorDetails, IArriveToDestinationCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/arriveToDestination';
    public setParameters(parameters: IArriveToDestinationCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
    };
}

export interface IArriveToDestinationCommandParameters extends ICommandParameters {
    travelId: number;
    carrierUserId: number;
}

export interface IArriveToDestinationResponse extends ICommandResponse {

}
