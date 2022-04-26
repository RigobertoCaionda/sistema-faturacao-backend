import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class NotaCreditos extends BaseSchema {
  protected tableName = "nota_creditos";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table.integer("quantity").notNullable();
      table
        .integer("venda_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("vendas")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .integer("selled_product_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("selled_products")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
