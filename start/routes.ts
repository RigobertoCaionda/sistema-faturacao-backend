import Route from "@ioc:Adonis/Core/Route";

Route.post("/signin", "AuthController.signin");
Route.post("/signup", "AuthController.signup").middleware("auth");
Route.get("/signout", "AuthController.signout").middleware("auth");
Route.get("/employee", "EmployeesController.readUser").middleware("auth");
Route.get("/me", "EmployeesController.me").middleware("auth");
Route.put("/update", "EmployeesController.update").middleware("auth");
Route.delete("/delete", "EmployeesController.delete").middleware("auth");
Route.post("/sell_product", "ProductsController.sellProduct").middleware(
  "auth"
);
Route.post("/create_product", "ProductsController.create").middleware("auth");
Route.get("/read_product", "ProductsController.readProduct");
Route.put("/update_product", "ProductsController.update").middleware("auth");
Route.delete("/delete_product", "ProductsController.deleteProduct").middleware(
  "auth"
);
Route.get("/expired_products", "ProductsController.expiredProducts");
Route.get("/categories_product", "ProductsController.getProductsByCategory");
Route.post("/nota_credito", "NotaCreditosController.notaCredito").middleware(
  "auth"
);
Route.get(
  "/consultar_nota_credito",
  "NotaCreditosController.consultarNotaCredito"
);
