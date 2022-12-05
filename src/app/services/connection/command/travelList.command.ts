import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';

export class TravelListCommand extends IRequestCommand<ITravelListResponse, ErrorDetails, ITravelListCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.GET;
    _commandUrl = 'carriers/{carrierUserId}/travels/paginated-driver?driverId={driverId}&page={page}&size={size}&column={column}&sort={sort}&programmed={scheduled}';
    public setParameters(parameters: ITravelListCommandParameters) {
        this._commandUrl = this._commandUrl
        .replace('{carrierUserId}', parameters.carrierUserId.toString())
        .replace('{driverId}', parameters.driverId.toString())
        .replace('{page}', parameters.page.toString())
        .replace('{size}', parameters.size.toString())
        .replace('{column}', parameters.column.toString())
        .replace('{sort}', parameters.sort.toString())
        .replace('{scheduled}', parameters.scheduled.toString());
        this._commandBody = parameters;
    };
}

export interface ITravelListCommandParameters extends ICommandParameters {
    carrierUserId: number;
    driverId: number;
    page: number;
    size: number;
    column: string;//"id"
    sort: string;//"ASC" "DESC"
    scheduled: boolean;
}

export interface ITravelListResponse extends ICommandResponse {
    
}