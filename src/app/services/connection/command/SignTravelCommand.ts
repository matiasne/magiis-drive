import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class SignTravelCommand extends IRequestCommand<ISignTravelResponse, ErrorDetails, ISignTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/sign';

    public setParameters (parameters: ISignTravelCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandBody = parameters;
    };
}

export interface ISignTravelCommandParameters extends ICommandParameters {
  travelId: number;           // TravelID.
  carrierUserId: number;      // CarrierID.
  dataSign: string;          // Travel signature.
}


export interface ISignTravelResponse extends ICommandResponse {
}
