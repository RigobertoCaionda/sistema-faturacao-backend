import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Employee from "App/Models/Employee";

export default class AuthController {
  public async signin({ auth, request }: HttpContextContract) {
    const { email, password } = request.all();
    const token = await auth.attempt(email, password, {
      expiresIn: "2 days",
    });
    return token;
  }

  public async signup({ auth, request, response }: HttpContextContract) {
    if (!auth.user?.admin) {
      return response
        .status(401)
        .send({ error: "Só os admnistradores podem cadastrar" });
    }
    let { name, email, password, isAdmin = false } = request.all();

    if (!name) {
      // return response.status
      return { error: "Preencha o nome" };
    }
    if (!email) {
      return { error: "Preencha o email" };
    }
    if (!password) {
      return { error: "Preencha a senha" };
    }

    let employee = await Employee.findBy("email", email);
    if (employee) {
      return response.status(401).send({ error: "Email já existe" });
    }

    await Employee.create({
      name,
      email,
      password,
      admin: isAdmin == "true" ? true : false,
    });
    const token = await auth.attempt(email, password, {
      expiresIn: "2 days",
    });
    return token;
  }

  public async signout({ auth }: HttpContextContract) {
    auth.logout();
  }
}
