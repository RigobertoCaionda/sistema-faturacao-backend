import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Category from "App/Models/Category";
import Product from "App/Models/Product";
import SelledProduct from "App/Models/SelledProduct";
import Venda from "App/Models/Venda";
import { DateTime } from "luxon";

type FaturaType = {
  name: string;
  priceTotal: number;
  price: number;
  quantity: number;
  category: string;
  vendaId: number;
  createdAt: DateTime;
};
type Products = {
  productId: number;
  quantity: number;
  vendaId?: number;
  price: number;
};
type updateProductType = {
  name?: string;
  price?: number;
  categoryId?: number;
  quantity?: number;
  expiresIn?: Date;
  stock?: number;
};
export default class ProductsController {
  priceTotalCmb = 0; // Variavel global (Para toda a aplicacao)
  public async calcularFatura(products: SelledProduct[]) {
    let fatura: FaturaType[] = [];
    for (let i in products) {
      let cat = await Category.find(products[i].product.categoryId); // Sempre vai retornar uma cat, caso contrario nao chegaria aqui
      this.priceTotalCmb += products[i].price * products[i].quantity;
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
    return fatura;
  }
  public async sellProduct({ auth }: HttpContextContract) {
    //const data = request.all(); // estaremos recebendo um array de objetos
    const data: Products[] = [
      { productId: 1, quantity: 1, price: 1500 },
      { productId: 2, quantity: 2, price: 50000 },
    ]; // Simulacao de dados vindo do backend
    if (data.length > 0) {
      let venda = await Venda.create({ employeeId: auth.user?.id });
      for (let product of data) {
        product.vendaId = venda.id;
      }
      let products: SelledProduct[] = []; // Se der bug no primeiro, a fatura sera vazia
      for (let i in data) {
        let product = await Product.find(data[i].productId);
        if (product && product.stock < data[i].quantity) {
          if (i == "0") {
            await venda.delete(); // Apaga a venda relacionada, caso der erro no primeiro produto
          }
          let fatura = await this.calcularFatura(products);
          return {
            data: {
              error: `Não pode vender uma quantidade maior que a do stock (Produto ${
                parseInt(i) + 1
              })`,
              fatura,
              priceTotalCmb: this.priceTotalCmb,
            },
          };
        }
        if (!product) {
          if (i == "0") {
            await venda.delete();
          }
          let fatura = await this.calcularFatura(products);
          return {
            data: {
              error: `Produto na posição ${parseInt(i) + 1} não existe`,
              fatura,
              priceTotalCmb: this.priceTotalCmb,
            },
          }; // A partir do produto que der errado, vc devera repetir todos os outros (Numa outra venda neste caso)
        }
        await SelledProduct.create(data[i]); // Nem chega a fazer a venda, retorna logo, caso  a quantidade desejada for maior que a do stock
        let currentStock = product.stock - data[i].quantity;
        product.merge({ stock: currentStock });
        await product.save();
        products = await SelledProduct.query()
          .where("vendaId", venda.id)
          .preload("product");
      }
      // Tratando os dados que serao retornados ao frontend como fatura
      let fatura = await this.calcularFatura(products); // Funcao que calcula a fatura, ela é assincrona, precisa do await
      return {
        data: { status: "ok", fatura, priceTotalCmb: this.priceTotalCmb },
      };
    } else {
      return { error: "Espera-se um array com os dados dos produtos vendidos" };
    }
  }

  public async create({ request, auth }: HttpContextContract) {
    const { name, price, categoryId, stock, expiresIn } = request.all();
    if (!auth.user?.admin) {
      return { error: "Sem permissão para criar" };
    }
    if (!name) {
      return { error: "Preencha o nome do produto" };
    }
    if (!price) {
      return { error: "Preencha o preço do produto" };
    }
    if (!categoryId) {
      return { error: "Preencha a categoria do produto" };
    }
    if (!stock) {
      return { error: "Preencha o stock do produto" };
    }
    if (!expiresIn) {
      return { error: "Preencha o expiresIn do produto" };
    }
    const category = await Category.find(categoryId);
    if (!category) {
      return { error: "Categoria inexistente" };
    }
    let date = new Date(expiresIn); // Enviar os parametros por virgula. Ex: 1995,11,17
    let product = await Product.create({
      name,
      price,
      categoryId,
      stock,
      expiresIn: date,
    });
    return { id: product.id };
  }

  public async readProduct({ request }: HttpContextContract) {
    const { id } = request.all();
    if (!id) {
      return { erro: "Id inválido" };
    }
    let product = await Product.find(id);
    return { product };
  }

  public async update({ request, auth }: HttpContextContract) {
    const { id, name, price, categoryId, quantity, expiresIn, stock } =
      request.all();
    if (!auth.user?.admin) {
      return { error: "Sem permissão para atualizar" };
    }
    if (!id) {
      return { error: "Id inválido" };
    }
    let product = await Product.find(id);
    if (!product) {
      return { error: "Produto não encontrado" };
    }
    let obj: updateProductType = {};
    if (name) {
      obj.name = name;
    }
    if (price) {
      obj.price = price;
    }
    if (categoryId) {
      let category = await Category.find(categoryId);
      if (!category) {
        return { error: "Categoria inexistente" };
      }
      obj.categoryId = categoryId;
    }
    if (quantity) {
      obj.quantity = quantity;
    }
    if (stock) {
      obj.stock = stock;
    }
    if (expiresIn) {
      obj.expiresIn = new Date(expiresIn); // Deve ser passada assim: ano,mes,dia
    }
    product.merge(obj);
    await product.save();
    return product;
  }

  public async deleteProduct({ auth, request }: HttpContextContract) {
    if (!auth.user?.admin) {
      return { error: "Sem permissão para apagar" };
    }
    const { id } = request.all();
    if (!id) {
      return { error: "Id inválido" };
    }
    let product = await Product.find(id);
    if (!product) {
      return { error: "Produto não encontrado" };
    }
    await product.delete();
  }

  public async expiredProducts() {
    let today = new Date();
    let products = await Product.query()
      .where("expiresIn", "<", today)
      .preload("category"); // Today deve ser menor que a data de expiracao, caso contrario ja expirou
    return products;
  }

  public async getProductsByCategory({ request }: HttpContextContract) {
    const { cat } = request.all();
    if (!cat) {
      return { error: "categoria inválida" };
    }
    let products = await Product.findBy("categoryId", cat);
    return products;
  }
}
