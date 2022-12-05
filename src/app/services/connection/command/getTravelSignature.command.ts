import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class TravelSignatureCommand extends IRequestCommand<ITravelSignatureResponse, ErrorDetails, ITravelSignatureCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierId}/travels/{travelId}/signature';
    public setParameters(parameters: ITravelSignatureCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
    };
}

export interface ITravelSignatureCommandParameters extends ICommandParameters {
    travelId: number;
    carrierId: number;
}

export interface ITravelSignatureResponse extends ICommandResponse {

}
