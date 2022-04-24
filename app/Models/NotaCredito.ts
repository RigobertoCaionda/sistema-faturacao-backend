import { DateTime } from "luxon";
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import SelledProduct from "./SelledProduct";
import Venda from "./Venda";

export default class NotaCredito extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public selledProductId: number;

  @column()
  public vendaId: number;

  @column()
  public quantity: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // RELACOES
  @hasMany(() => SelledProduct)
  public selledProduct: HasMany<typeof SelledProduct>; // Uma nota de credito tem muitos produtos vendidos

  @belongsTo(() => Venda)
  public venda: BelongsTo<typeof Venda>; // Uma nota de credito pertence a uma venda
}
