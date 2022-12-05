import { IRequestCommand } from "../iRequestCommand";
import { ErrorDetails } from "../interfaces/apiInterfaces";
import { CommandRequestType } from "../commandRequestType";
import { ICommandParameters } from "../iCommandParameters";
import { ICommandResponse } from "../iCommandResponse";

export class GetWaypointsCommand extends IRequestCommand<
  IGetWaypointsResponse,
  ErrorDetails,
  IGetWaypointsCommandParameters
> {
  _commandType = CommandRequestType.GET;

  public setUrlParameters(carrierUserId:number, travelId: number): void {
    this._commandUrl = "carriers/{carrierUserId}/travels/{travelId}/getTravelRouteByLog";
    this._commandUrl = this._commandUrl.replace(
      "{carrierUserId}",
      carrierUserId.toString()
    );
    this._commandUrl = this._commandUrl.replace(
      "{travelId}",
      travelId.toString()
    );
  }
}

export interface IGetWaypointsCommandParameters extends ICommandParameters {}

export interface IGetWaypointsResponse extends ICommandResponse {}
