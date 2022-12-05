import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails, IParkingDetailResponse } from '../interfaces/apiInterfaces';

export class GetTravelParkingCommand extends IRequestCommand<IGetTravelParkingResponse, ErrorDetails, IGetTravelParkingCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.GET;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/parking/{parkingId}';

  setParameters(parameters: IGetTravelParkingCommandParameters) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
    this._commandUrl = this._commandUrl.replace('{parkingId}', parameters.parkingId.toString());
  };
}

export interface IGetTravelParkingCommandParameters extends ICommandParameters {
  carrierId: number;
  travelId: number;
  parkingId: number;
}

export interface IGetTravelParkingResponse extends ICommandResponse, IParkingDetailResponse {}
