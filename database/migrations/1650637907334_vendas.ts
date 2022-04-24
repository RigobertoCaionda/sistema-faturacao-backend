import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Vendas extends BaseSchema {
  protected tableName = "vendas";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table
        .integer("employee_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("employees")
        .onUpdate("CASCADE"); // Se um funcionario é apagado, ele nao necessariamente tem que apagar as vendas que ele fez, mas se o id dele é atualizado, faz sentido que atualize tmbm nas suas relacoes.

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
