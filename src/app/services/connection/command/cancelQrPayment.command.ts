import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class CancelQrPaymentCommand extends IRequestCommand<ICancelQrPaymentResponse, ErrorDetails, ICancelQrPaymentCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.PUT;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/qrPayment/cancel?driverId={driverId}';
  public setParameters(parameters: ICancelQrPaymentCommandParameters) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
    this._commandUrl = this._commandUrl.replace('{driverId}', parameters.driverId.toString());
  };
}

export interface ICancelQrPaymentCommandParameters extends ICommandParameters {
  carrierId: string;
  travelId: string;
  driverId: string;
}

export interface ICancelQrPaymentResponse extends ICommandResponse {}
