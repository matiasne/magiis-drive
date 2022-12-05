import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class SetInBaseCommand extends IRequestCommand<ICommandResponse, ErrorDetails, ICommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.PUT;
    _commandUrl = 'carriers/{carrierId}/drivers/{driverUserId}/setInBase/latitud/{latitud}/longitude/{longitude}';
    _needAuthenticate = true;
    public setParameters(parameters: ISetInBaseCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{driverUserId}', parameters.driverUserId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierId}', parameters.carrierId.toString());
        this._commandUrl = this._commandUrl.replace('{latitud}', parameters.latitud.toString());
        this._commandUrl = this._commandUrl.replace('{longitude}', parameters.longitude.toString());

    };
}

export interface ISetInBaseCommandParameters extends ICommandParameters {
    driverUserId: string;
    carrierId: string;
    latitud: string;
    longitude: string;
}

export interface ISetInBaseCommandResponse extends ICommandResponse {
    result: string;
}

