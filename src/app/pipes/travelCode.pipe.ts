import { Pipe, PipeTransform } from '@angular/core';
import { TravelListModel } from '../models/travel-list.model';

@Pipe({
	name: 'travelCode'
})
export class TravelCodePipe implements PipeTransform {

	transform(value: TravelListModel): string {
		let platform : string;
		if(value.travelIdForCarrier && value.originPlatform){
			switch(value.originPlatform) { 
				case 'Web': { 
					platform = 'W';
					break; 
				} 
				case 'Android': { 
					platform = 'MA';
					break; 
				}
				case 'Ios': { 
					platform = 'MI';
					break; 
				} 
				case 'Manual': { 
					platform = 'M';
					break; 
				} 
				default: {
					platform='';
				}
			} 
			return value.travelIdForCarrier+"-"+platform;
		}
	}

}