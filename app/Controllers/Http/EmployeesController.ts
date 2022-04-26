import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Employee from "App/Models/Employee";

type objType = {
  email?: string;
  password?: string;
  name?: string;
  admin?: boolean;
};
export default class EmployeesController {
  public async readUser({ request, auth, response }: HttpContextContract) {
    const { search } = request.all();
    // let employee = await Employee.query().where("name", "like", "%" + search + "%").andWhere("id", 2); Caso vc queira juntar duas condicoes com 'e', é possivel juntar duas condicoes com 'ou' tmbm
    if (!auth.user?.admin) {
      return response
        .status(401)
        .send({ error: "Busca disponível apenas a admins" });
    }
    let employee = await Employee.query().where(
      "name",
      "like",
      "%" + search + "%"
    );
    return { employee };
  }

  public async update({ auth, request }: HttpContextContract) {
    const { id, email, password, name, isAdmin } = request.all();
    let employee: Employee = {} as Employee;
    if (auth.user?.admin == false) {
      employee = (await Employee.find(auth.user?.id)) as Employee; // Pode receber null o Employee, forcei para que seja Employee
      employee.merge({ email, password, name });
    } else {
      if (id) {
        employee = (await Employee.find(id)) as Employee;
      } else {
        employee = (await Employee.find(auth.user?.id)) as Employee;
      }
      const obj: objType = {};
      if (email) {
        obj.email = email;
      }
      if (password) {
        obj.password = email;
      }
      if (name) {
        obj.name = name;
      }
      if (isAdmin) {
        obj.admin = isAdmin == "true" ? true : false;
      }
      if (!employee) {
        return { error: "Funcionário inexistente" };
      }
      employee.merge(obj);
    }
    await employee.save();
    return { employee };
  }

  public async delete({ auth, request }: HttpContextContract) {
    const { id } = request.all();
    let employee: Employee;
    if (auth.user?.admin == false) {
      employee = (await Employee.find(auth.user.id)) as Employee;
    } else {
      if (id) {
        employee = (await Employee.find(id)) as Employee;
      } else {
        employee = (await Employee.find(auth.user?.id)) as Employee;
      }
    }
    if (!employee) {
      return { error: "Funcionário inexistente" };
    }
    await employee.delete();
  }

  public async me({ auth }: HttpContextContract) {
    return { employee: auth.user };
  }
}
