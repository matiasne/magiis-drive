import { Location } from './location.model';

export class RouteWaypointModel {

  location: Location;
  fromPlaceId: number;
  segment: number;
  timestamp: string;

  constructor(location: Location, fromPlaceId: number, segment: number, timestamp: string) {
    this.location = location;
    this.fromPlaceId = fromPlaceId;
    this.segment = segment;
    this.timestamp = timestamp;
  }

}
