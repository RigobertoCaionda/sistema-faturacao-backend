import { DateTime } from "luxon";
import { BaseModel, belongsTo, BelongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Venda from "./Venda";
import NotaCredito from "./NotaCredito";
import Product from "./Product";

export default class SelledProduct extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public productId: number;

  @column()
  public quantity: number;

  @column()
  public price: number;

  @column()
  public vendaId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // RELACOES

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>; // A tabela que está a levar  a chave primaria da outra é que vai o belongsTo em relacionamentos 1:N

  @belongsTo(() => Venda)
  public venda: BelongsTo<typeof Venda>;

  @belongsTo(() => NotaCredito)
  public notaCredito: BelongsTo<typeof NotaCredito>; // Um produto vendido pertence apenas a uma nota de credito
}
