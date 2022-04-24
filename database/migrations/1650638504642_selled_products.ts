import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class SelledProducts extends BaseSchema {
  protected tableName = "selled_products";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table.string("name").notNullable();
      table.double("price").notNullable();
      table
        .integer("category_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("categories")
        .onUpdate("CASCADE"); // Nao vai o onDelete pq se uma categoria é apagada, nao tem que apagar os produtos vendidos dessa categoria, mas se o id da categoria mudar, faz sentido mudar em todo mundo
      table.integer("quantity").notNullable();
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
