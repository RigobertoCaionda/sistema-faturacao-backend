import { DateTime } from "luxon";
import { BaseModel, belongsTo, BelongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Category from "./Category";
import Venda from "./Venda";
import NotaCredito from "./NotaCredito";

export default class SelledProduct extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public price: string;

  @column()
  public categoryId: number;

  @column()
  public quantity: number;

  @column()
  public vendaId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // RELACOES
  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>; // Um produto vendido pertence a so uma categoria.

  @belongsTo(() => Venda)
  public venda: BelongsTo<typeof Venda>;

  @belongsTo(() => NotaCredito)
  public notaCredito: BelongsTo<typeof NotaCredito>; // Um produto vendido pertence apenas a uma nota de credito
}
