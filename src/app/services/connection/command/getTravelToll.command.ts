import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, ITollDetailResponse } from '../interfaces/apiInterfaces';

export class GetTravelTollCommand extends IRequestCommand<IGetTravelTollResponse, ErrorDetails, IGetTravelTollCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.GET;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/toll/{tollId}';

  setParameters(parameters: IGetTravelTollCommandParameters) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
    this._commandUrl = this._commandUrl.replace('{tollId}', parameters.tollId.toString());
  };
}

export interface IGetTravelTollCommandParameters extends ICommandParameters {
  carrierId: number;
  travelId: number;
  tollId: number;
}

export interface IGetTravelTollResponse extends ICommandResponse, ITollDetailResponse {}
