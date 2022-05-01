import Category from "App/Models/Category";
import SelledProduct from "App/Models/SelledProduct";
import { FaturaType } from "App/types/products";

export default class {
  public async calcularFatura(
    products: SelledProduct[],
    priceTotalCmb: number
  ) {
    let fatura: FaturaType[] = [];
    for (let i in products) {
      let cat = await Category.find(products[i].product.categoryId);
      priceTotalCmb += products[i].price * products[i].quantity;
      fatura.push({
        name: products[i].product.name,
        priceTotal: products[i].price * products[i].quantity,
        price: products[i].price,
        quantity: products[i].quantity,
        category: cat?.name as string,
        vendaId: products[i].vendaId,
        createdAt: products[i].createdAt,
      });
    }
    return { fatura, priceTotalCmb };
  }
}
