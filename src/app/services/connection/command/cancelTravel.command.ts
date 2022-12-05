import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class CancelTravelCommand extends IRequestCommand<ICancelTravelResponse, ErrorDetails, ICancelTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.PUT;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/cancel';
    public setParameters(parameters: ICancelTravelCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandBody = parameters;
    };
}

export interface ICancelTravelCommandParameters extends ICommandParameters {
    travelId: number;
    carrierUserId: number;
    reasonForCancellation: string;
    canceledBy: string;
}

export interface ICancelTravelResponse extends ICommandResponse {

}