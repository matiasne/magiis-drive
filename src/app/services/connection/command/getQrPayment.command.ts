import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class GetQrPaymentCommand extends IRequestCommand<IGetQrPaymentResponse, ErrorDetails, IGetQrPaymentCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.GET;
  _commandUrl = 'carriers/{carrierId}/travels/{travelId}/qrPayment?driverId={driverId}&amount={amount}';
  public setParameters(parameters: IGetQrPaymentCommandParameters) {
    this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
    this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
    this._commandUrl = this._commandUrl.replace('{driverId}', parameters.driverId.toString());
    this._commandUrl = this._commandUrl.replace('{amount}', parameters.amount.toString());
  };
}

export interface IGetQrPaymentCommandParameters extends ICommandParameters {
  carrierId: string;
  travelId: string;
  driverId: string;
  amount: number;
}

export interface IGetQrPaymentResponse extends ICommandResponse {
  qr: string;
  transactionPaymentId: string;
}
