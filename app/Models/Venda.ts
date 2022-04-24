import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Employee from "./Employee";
import SelledProduct from "./SelledProduct";
import NotaCredito from "./NotaCredito";

export default class Venda extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public employeeId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  //RELACOES
  @belongsTo(() => Employee)
  public employee: BelongsTo<typeof Employee>; //Estamos dizendo que uma venda pertence a um Funcionario apenas

  @hasMany(() => SelledProduct)
  public selledProduct: HasMany<typeof SelledProduct>; // Uma venda tem muitos produtos vendidos

  @hasMany(() => NotaCredito)
  public notaCredito: HasMany<typeof NotaCredito>; // Uma venda pode ter muitas notas de credito.
}
