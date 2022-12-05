import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';;

export class GetPaymentMethodCommand extends IRequestCommand<IGetPaymentMethodResponse, ErrorDetails, IGetPaymentMethodCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'users/clients/{clientId}/carrier/{carrierEmail}/paymentMethods';
    public setParameters(parameters: IGetPaymentMethodCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{clientId}', parameters.clientId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierEmail}', parameters.carrierEmail.toString());
    };
}

export interface IGetPaymentMethodCommandParameters extends ICommandParameters {
    clientId: string;
    carrierEmail: string;
}

export interface IGetPaymentMethodResponse extends ICommandResponse {

}
