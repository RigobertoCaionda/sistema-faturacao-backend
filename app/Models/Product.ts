import { DateTime } from "luxon";
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Category from "./Category";
import SelledProduct from "./SelledProduct";

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public price: number;

  @column()
  public categoryId: number;

  @column()
  public stock: number;

  @column()
  public expiresIn: Date;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  //RELACOES
  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>;

  @hasMany(() => SelledProduct)
  public selledProduct: HasMany<typeof SelledProduct>;
}
