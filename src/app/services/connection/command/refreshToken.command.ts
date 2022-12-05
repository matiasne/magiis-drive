import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';
import { PlatformEnum } from '../../enum/platform.enum';

export class RefreshTokenCommand extends IRequestCommand<ICommandResponse, ErrorDetails, ICommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'drivers/{driverUserId}/refreshStatus';
    _needAuthenticate = true;
    public setParameters(parameters: IRefreshTokenCommandCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{driverUserId}', parameters.driverUserId.toString());
        this._commandBody = parameters;
    };
}

export interface IRefreshTokenCommandCommandParameters extends ICommandParameters {
    firebaseToken: string;
    driverUserId: string;
    platform: PlatformEnum;
    driverState: string;
    driverSubState: string;
    latitud: string;
    longitud: string;
    outOfService: boolean;
}

export interface IRefreshTokenCommandResponse extends ICommandResponse {
    username: string;
}

