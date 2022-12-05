import { IRequestCommand } from "../iRequestCommand";
import { CommandRequestType } from "../commandRequestType";
import { ICommandParameters } from "../iCommandParameters";
import { ICommandResponse } from "../iCommandResponse";
import { ErrorDetails } from "../interfaces/apiInterfaces";

export class UpdateTravelAuditCommand extends IRequestCommand<
  IUpdateTravelAuditResponse,
  ErrorDetails,
  IUpdateTravelAuditCommandParameters
> {
  _commandType: CommandRequestType = CommandRequestType.PUT;
  _commandUrl = "carriers/{carrierId}/travels/{travelId}/audit";
  public setUrlParameters(carrierUserId: number, travelId: number) {
    this._commandUrl = this._commandUrl
      .replace("{carrierId}", carrierUserId.toString())
      .replace("{travelId}", travelId.toString());
  }
  public addCommandBody(body: IUpdateTravelAuditCommandParameters): void {
    this._commandBody = body;
  }
}

export interface IUpdateTravelAuditCommandParameters extends ICommandParameters {
  travelId?: number;
  id?: number;
  idForCarrier?: number;
  carrierId?: number;
  creationDate?: Date;
  channel?: string;
  channelUserId?: number;
  channelUserName?: string;
  channelVersion?: string;
  webVersion?: string;
  carrierRateName?: string;
  carrierRateIsActive?: boolean;
  carrierRateType?: string;
  carrierRateId?: number;
  carrierRateVersion?: string;
  vehicleId?: number;
  driverId?: number;
  driverName?: string;
  driverAppVersion?: string;
  driverOsType?: string;
  driverOsVersion?: string;
  driverPhoneModel?: string;
  driverAcceptTime?: Date;
  driverAcceptPosition?: string;
  driverDistanceToPax?: number;
  driverRateId?: number;
  driverRateVersion?: string;
  paxUserId?: number;
  paxName?: string;
  paxAppVersion?: string;
  paxOsType?: string;
  paxOsVersion?: string;
  paxPhoneModel?: string;
  paxWaitingTime?: number;
  travelStartTime?: Date;
  travelFinishTime?: Date;
  tripDelta?: number;
  driverPlacesUpdate?: boolean;
  driverPickupPosition?: string;
  driverPickupDistance?: number;
}

export interface IUpdateTravelAuditResponse extends ICommandResponse {}
