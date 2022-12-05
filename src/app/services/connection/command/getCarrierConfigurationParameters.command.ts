import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class ReadParametersCommand extends IRequestCommand<IReadParametersCommandResponse, ErrorDetails, IReadParametersCommandRequest> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierUserId}/parameters';
    public setParameters(parameters: IReadParametersCommandRequest) {
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
    };
}

export interface IReadParametersCommandRequest extends ICommandParameters {
    carrierUserId: number;
}

export interface IReadParametersCommandResponse extends ICommandResponse {

}
