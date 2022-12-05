import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class RefuseTravelCommand extends IRequestCommand<IRefuseTravelResponse, ErrorDetails, IRefuseTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/refuse';
    public setParameters(parameters: IRefuseTravelCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandBody = parameters;
    };
}

export interface IRefuseTravelCommandParameters extends ICommandParameters {
    travelId: number;
    carrierUserId: number;
    driverUserId: number;
}

export interface IRefuseTravelResponse extends ICommandResponse {

}
