import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, IParkingDetailResponse } from '../interfaces/apiInterfaces';

export class PutTravelParkingCommand extends IRequestCommand<IPutTravelParkingResponse, ErrorDetails, IPutTravelParkingCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.PUT;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/parking/{parkingId}';

  setUrlParameters(carrierId: number, travelId: number, parkingId: number) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', travelId.toString());
    this._commandUrl = this._commandUrl.replace('{parkingId}', parkingId.toString());
  };

  addCommandBody(body: IPutTravelParkingCommandParameters): void {
    this._commandBody = body;
  }
}

export interface IPutTravelParkingCommandParameters
  extends IParkingDetailResponse, ICommandParameters {}

export interface IPutTravelParkingResponse extends ICommandResponse {}
