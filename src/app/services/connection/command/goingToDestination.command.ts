import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class GoingToDestinationCommand extends IRequestCommand<IGoingToDestinationResponse, ErrorDetails, IGoingToDestinationCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/goingToDestination/{codeOK}';
    public setParameters(parameters: IGoingToDestinationCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandUrl = this._commandUrl.replace('{codeOK}', parameters.codeOK.toString());
    };
}

export interface IGoingToDestinationCommandParameters extends ICommandParameters {
    travelId: number;
    carrierUserId: number;
    codeOK: boolean;
}

export interface IGoingToDestinationResponse extends ICommandResponse {

}
