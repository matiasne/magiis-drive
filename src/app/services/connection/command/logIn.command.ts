import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class LogInCommand extends IRequestCommand<ICommandResponse, ErrorDetails, ICommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'auth/login';
    _replaceDefaultHeader = true;
    _canAddCustomHeaders = true;
    _needAuthenticate = false;
}

export interface ILogInCommandParameters extends ICommandParameters {
    username: string;
    password: string;
}

export interface ILogInResponse extends ICommandResponse {
  userId: string;
  token: string;
}
