import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class SelledProducts extends BaseSchema {
  protected tableName = "selled_products";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table
        .integer("product_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("products")
        .onUpdate("CASCADE"); // Nao vai o onDelete pq se um produto é apagado, nao tem que apagar os produtos vendidos desse produto, mas se o id do produto mudar, faz sentido mudar em todo mundo
      table.integer("quantity").notNullable();
      table.double("price").notNullable();
      table
        .integer("venda_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("vendas")
        .onDelete("CASCADE")
        .onUpdate("CASCADE"); // Faz sentido que se o a venda foi apagada, entao todos os produtos dessa venda, vao junto

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
