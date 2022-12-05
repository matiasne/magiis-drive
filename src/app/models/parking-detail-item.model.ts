export class ParkingDetailItemModel {
  name: string;
  price: number;
  date: Date;
  image: string;

  constructor(name: string, price: number, image: string) {
    this.name = name;
    this.price = price;
    this.date = new Date();
    this.image = image;
  }
}
