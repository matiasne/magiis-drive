import { IRequestCommand } from "../iRequestCommand";
import { ErrorDetails } from "../interfaces/apiInterfaces";
import { CommandRequestType } from "../commandRequestType";
import { TravelUpdate } from "../../../models/travel-update.model";
import { ICommandParameters } from "../iCommandParameters";
import { ICommandResponse } from "../iCommandResponse";

export class PutTravelCommand extends IRequestCommand<
  IPutTravelResponse,
  ErrorDetails,
  IPutTravelCommandParameters
> {
  _commandType = CommandRequestType.PUT;

  public setUrlParameters(id: number, travelId: number): void {
    this._commandUrl = "carriers/{carrierUserId}/travels/{travelId}/update";
    this._commandUrl = this._commandUrl.replace(
      "{travelId}",
      travelId.toString()
    );
    this._commandUrl = this._commandUrl.replace(
      "{carrierUserId}",
      id.toString()
    );
  }

  public addCommandBody(body: IPutTravelCommandParameters): void {
    this._commandBody = body;
  }
}

export interface IPutTravelCommandParameters
  extends TravelUpdate,
    ICommandParameters {}

export interface IPutTravelResponse extends ICommandResponse {}
