import Route from "@ioc:Adonis/Core/Route";

Route.post("/signin", "AuthController.signin");
Route.post("/signup", "AuthController.signup").middleware("auth");
Route.get("/signout", "AuthController.signout").middleware("auth");
