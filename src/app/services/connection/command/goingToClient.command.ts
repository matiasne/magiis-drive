import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class GoingToClientCommand extends IRequestCommand<IGoingToClientResponse, ErrorDetails, IGoingToClientCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/confirm';
    public setParameters(parameters: IGoingToClientCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandBody = parameters;
    };
}

export interface IGoingToClientCommandParameters extends ICommandParameters {
    travelId: number;
    carrierUserId: number;
    driverUserId: number;
}

export interface IGoingToClientResponse extends ICommandResponse {
    travelId: number;
    paymentMethod: string;
    passengerId: number;
    passengerPhoneNumber: string;
    checkingAccount: CheckingAccount;
    usesGeoFence: boolean;

    paymentSettings: Array<{
      paymentMethod:string,
      isEnabled:boolean
    }>;

    requesterUserContractor:boolean;

}

export class CheckingAccount {
    id: number = 0;
    balance: number = 0;
    limit: number = 0;
    exceedingLimit: boolean = false;
    enabled: boolean = false;
}
