import {ErrorDetails, TimezoneResponse,} from '../../connection/interfaces/apiInterfaces';
import {IRequestCommand} from '../../connection/iRequestCommand';
import {CommandRequestType} from '../../connection/commandRequestType';
import {ICommandParameters} from '../../connection/iCommandParameters';
import {ICommandResponse} from '../../connection/iCommandResponse';

export class ListTimezonesCommand extends IRequestCommand<IListTimezonesCommandResponse,
    ErrorDetails,
    IListTimezonesCommandParameters> {
  _commandType: CommandRequestType = CommandRequestType.GET;
  _commandUrl = 'multiregion/timezones';
}

export interface IListTimezonesCommandParameters
    extends ICommandParameters {
}

export interface IListTimezonesCommandResponse
    extends Array<TimezoneResponse>,
        ICommandResponse {
}
