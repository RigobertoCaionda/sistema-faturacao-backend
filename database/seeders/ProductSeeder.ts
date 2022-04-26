import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Product from "App/Models/Product";

export default class ProductSeederSeeder extends BaseSeeder {
  public async run() {
    await Product.create({
      name: "Controle Remoto",
      price: 1200,
      categoryId: 1,
      stock: 20,
      expiresIn: new Date(),
    });
    await Product.create({
      name: "IPhone 12",
      price: 60000,
      categoryId: 1,
      stock: 13,
      expiresIn: new Date(),
    });
  }
}
