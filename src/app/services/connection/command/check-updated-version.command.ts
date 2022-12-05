import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class CheckUpdatedVersionCommand extends IRequestCommand<ICheckUpdatedVersionResponse, ErrorDetails, ICheckUpdatedVersionCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'versions/verifyVersion/{appName}/platform/{platform}/version/{version}';
    public setParameters(parameters: ICheckUpdatedVersionCommandParameters) {
        this._commandUrl = this._commandUrl
        .replace('{appName}', parameters.appName.toString())
        .replace('{platform}', parameters.platform.toString())
        .replace('{version}', parameters.version.toString());
        this._commandBody = parameters;
    };
}

export interface ICheckUpdatedVersionCommandParameters extends ICommandParameters {
  appName: string;
  platform: string;
  version: string | number;
}

export interface ICheckUpdatedVersionResponse extends ICommandResponse {
  result: string;
}
