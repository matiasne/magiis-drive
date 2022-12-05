export class StatsResponse {
        numberOfTrips: number = 0;
        moneyOfTrips: number = 0;
        distanceTraveled: number = 0;
        numberOfRatings: number = 0;
        ratings: Array<RatingModel> = new Array<RatingModel>();

        constructor() {
                this.ratings.push(new RatingModel());
                this.ratings.push(new RatingModel());
                this.ratings.push(new RatingModel());
                this.ratings.push(new RatingModel());
                this.ratings.push(new RatingModel());
        }
}

export class RatingModel {
        id: number = 0;
        rate: number = 0;
        description: string = "";
        name: string = "";
}