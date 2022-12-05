import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, ITollDetailResponse } from '../interfaces/apiInterfaces';

export class PutTravelTollCommand extends IRequestCommand<IPutTravelTollResponse, ErrorDetails, IPutTravelTollCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.PUT;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/toll/{tollId}';

  setUrlParameters(carrierId: number, travelId: number, tollId: number) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', travelId.toString());
    this._commandUrl = this._commandUrl.replace('{tollId}', tollId.toString());
  };

  addCommandBody(body: IPutTravelTollCommandParameters): void {
    this._commandBody = body;
  }
}

export interface IPutTravelTollCommandParameters
  extends ITollDetailResponse, ICommandParameters {}

export interface IPutTravelTollResponse extends ICommandResponse {}
