import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Category from "App/Models/Category";

export default class CategorySeederSeeder extends BaseSeeder {
  public async run() {
    await Category.create({
      name: "bebidas",
    });

    await Category.create({
      name: "eletronicos",
    });

    await Category.create({
      name: "carros",
    });

    await Category.create({
      name: "roupas",
    });
  }
}
