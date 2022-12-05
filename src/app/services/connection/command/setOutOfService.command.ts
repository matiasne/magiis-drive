import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class SetOutOfServiceCommand extends IRequestCommand<ICommandResponse, ErrorDetails, ICommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.PUT;
    _commandUrl = 'carriers/{carrierUserId}/drivers/{driverUserId}/outOfService';
    _needAuthenticate = true;
    public setParameters(parameters: ISetOutOfServiceCommandParameters) {
      this._commandUrl = this._commandUrl.replace(
        '{driverUserId}',
        parameters.driverUserId.toString()
      );
      this._commandUrl = this._commandUrl.replace(
        '{carrierUserId}',
        parameters.carrierUserId.toString()
      );
      this._commandBody = parameters;
    };
}

export interface ISetOutOfServiceCommandParameters extends ICommandParameters {
  enabled: boolean;
  driverUserId: number;
  carrierUserId: number;
}

export interface ISetOutOfServiceCommandResponse extends ICommandResponse {}
