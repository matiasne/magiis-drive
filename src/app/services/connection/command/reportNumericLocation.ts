import { IRequestCommand } from "../iRequestCommand";
import { ErrorDetails } from "../interfaces/apiInterfaces";
import { CommandRequestType } from "../commandRequestType";
import { ICommandParameters } from "../iCommandParameters";
import { ICommandResponse } from "../iCommandResponse";

export class ReportNumericLocationCommand extends IRequestCommand<
  IReportNumericLocationResponse,
  ErrorDetails,
  IReportNumericLocationCommandParameters
> {
  _commandType = CommandRequestType.POST;

  public setUrlParameters(driverId: string): void {
    this._commandUrl = "drivers/{driverId}/reportNumericLocation";
    this._commandUrl = this._commandUrl.replace("{driverId}", driverId);
  }

  public addCommandBody(body: IReportNumericLocationCommandParameters): void {
    this._commandBody = body;
  }
}

export interface IReportNumericLocationCommandParameters extends ICommandParameters {
  location: { latitude: number; longitude: number };
  geofence: { latitude: number; longitude: number };
  fromId: number;
  segmentNumber: number;
}

export interface IReportNumericLocationResponse extends ICommandResponse {}
