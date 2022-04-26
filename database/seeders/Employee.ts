import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Employee from "App/Models/Employee";

export default class EmployeeSeeder extends BaseSeeder {
  public async run() {
    await Employee.create({
      name: "Cristiana Caionda",
      email: "cristianacaionda@gmail.com",
      password: "123",
      admin: false,
    });

    await Employee.create({
      name: "Rigoberto Caionda",
      email: "rigobertocaionda98@gmail.com",
      password: "123",
      admin: true,
    });
  }
}
