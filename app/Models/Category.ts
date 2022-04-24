import { DateTime } from "luxon";
import { BaseModel, column, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import SelledProduct from "./SelledProduct";
import Product from "./Product";

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // RELACOES
  @hasMany(() => SelledProduct)
  public selledProduct: HasMany<typeof SelledProduct>; // Uma categoria faz parte de muitos produtos vendidos

  @hasMany(() => Product)
  public product: HasMany<typeof Product>; // Uma categoria tem muitos produtos.
}
