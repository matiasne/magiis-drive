export class PlaceModel {
  id        : number = null; // Represents the id of the db.
  latitude  : string = '';
  longitude : string = '';
  shortName?: string = '';
  placeId?  : string = '';

  constructor() {
    this.id = null;
    this.latitude = '';
    this.longitude = '';
    this.shortName = '';
    this.placeId = '';
  }
}
