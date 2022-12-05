import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, IOtherCostDetailResponse } from '../interfaces/apiInterfaces';

export class PutTravelOtherCostCommand extends IRequestCommand<IPutTravelOtherCostResponse, ErrorDetails, IPutTravelOtherCostCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.PUT;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/otherCost/{otherCostId}';

  setUrlParameters(carrierId: number, travelId: number, otherCostId: number) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', travelId.toString());
    this._commandUrl = this._commandUrl.replace('{otherCostId}', otherCostId.toString());
  };

  addCommandBody(body: IPutTravelOtherCostCommandParameters): void {
    this._commandBody = body;
  }
}

export interface IPutTravelOtherCostCommandParameters
  extends IOtherCostDetailResponse, ICommandParameters {}

export interface IPutTravelOtherCostResponse extends ICommandResponse {}
