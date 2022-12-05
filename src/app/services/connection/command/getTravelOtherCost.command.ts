import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, IOtherCostDetailResponse } from '../interfaces/apiInterfaces';

export class GetTravelOtherCostCommand extends IRequestCommand<IGetTravelOtherCostResponse, ErrorDetails, IGetTravelOtherCostCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.GET;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/otherCost/{otherCostId}';

  setParameters(parameters: IGetTravelOtherCostCommandParameters) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
    this._commandUrl = this._commandUrl.replace('{otherCostId}', parameters.otherCostId.toString());
  };
}

export interface IGetTravelOtherCostCommandParameters extends ICommandParameters {
  carrierId: number;
  travelId: number;
  otherCostId: number;
}

export interface IGetTravelOtherCostResponse extends ICommandResponse, IOtherCostDetailResponse {}
