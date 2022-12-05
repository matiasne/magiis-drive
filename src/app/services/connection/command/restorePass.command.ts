import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class RestorePassCommand extends IRequestCommand<ICommandResponse, ErrorDetails, ICommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'users/resetPassword';
}

export interface IRestorePassParameters extends ICommandParameters {
    email: string;
}

export interface IRestorePassResponse extends ICommandResponse {

}