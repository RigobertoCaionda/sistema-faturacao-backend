import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ProductHelper from "App/helpers/ProductHelper";
import Category from "App/Models/Category";
import Product from "App/Models/Product";
import SelledProduct from "App/Models/SelledProduct";
import Venda from "App/Models/Venda";
import {
  GenericReturnType,
  Products,
  updateProductType,
} from "../../types/products";

export default class ProductsController {
  private productHelper = new ProductHelper(); // Pq nao funciona injetando essa dependencia diretamente no construtor? Retorna um erro dizendo que nao pode ler propriedade de undefined, reading calcularFatura
  priceTotalCmb = 0; // Variavel global (Para toda a aplicacao)
  public async sellProduct({ auth }: HttpContextContract) {
    //const data = request.all(); // estaremos recebendo um array de objetos
    const data: Products[] = [
      { productId: 3, quantity: 2 },
      { productId: 1, quantity: 3 },
    ]; // Simulacao de dados vindo do frontend
    if (data.length > 0) {
      let venda = await Venda.create({ employeeId: auth.user?.id });
      for (let product of data) {
        let prod = await Product.find(product.productId);
        product.vendaId = venda.id;
        product.price = prod?.price as number;
      }
      let products: SelledProduct[] = []; // Se der erro no primeiro produto, a fatura sera vazia
      for (let i in data) {
        let product = await Product.find(data[i].productId);
        if (product && product.stock < data[i].quantity) {
          if (i == "0") {
            await venda.delete(); // Apaga a venda relacionada, caso der erro no primeiro produto
          }
          let fatura = await this.productHelper.calcularFatura(
            products,
            this.priceTotalCmb
          );
          return {
            data: {
              error: `Não pode vender uma quantidade maior que a do stock (Produto ${
                parseInt(i) + 1
              })`,
              fatura,
            },
          };
        }
        if (!product) {
          if (i == "0") {
            await venda.delete();
          }
          let fatura = await this.productHelper.calcularFatura(
            products,
            this.priceTotalCmb
          );
          return {
            data: {
              error: `Produto na posição ${parseInt(i) + 1} não existe`,
              fatura,
            },
          }; // A partir do produto que der errado, é necessário repetir todos os outros (Numa outra venda neste caso)
        }
        await SelledProduct.create(data[i]); // Nem chega a fazer a venda, retorna logo o erro, caso  a quantidade desejada for maior que a do stock
        let currentStock = product.stock - data[i].quantity;
        product.merge({ stock: currentStock });
        await product.save();
        products = await SelledProduct.query()
          .where("vendaId", venda.id)
          .preload("product");
      }
      // Tratando os dados que serao retornados ao frontend como fatura
      let fatura = await this.productHelper.calcularFatura(
        products,
        this.priceTotalCmb
      );
      return { data: { status: "ok", fatura } };
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
    let products = await Product.query()
      .where("categoryId", cat)
      .preload("category"); // O findBy retorna o primeiro registro que achar
    return { products };
  }

  public async howManySold({ request }: HttpContextContract) {
    const { productId } = request.all();
    if (!productId) {
      return { error: "Deve enviar o productId" };
    }
    let quantity = await SelledProduct.query().where("productId", productId);
    return { quantity: quantity.length };
  }

  public async mostSold({}: HttpContextContract) {
    let products = await Product.all(); // Retorna todos, depois coloca todos num array
    let mSold: GenericReturnType[] = [];
    for (let prod of products) {
      let total = await SelledProduct.query()
        .select("*")
        .where("productId", prod.id); // Nos produtos que nao foram vendidos vai retornar length 0
      let tot = 0;
      for (let i in total) {
        tot += total[i].quantity;
      }
      mSold.push({ name: prod.name, total: tot });
    }
    let novoRetorno = mSold.filter((item) => item.total > 0);
    let highestToLowest = novoRetorno.sort((a, b) => b.total - a.total);
    let slice = highestToLowest.slice(0, 5);

    return { mSold: slice };
  }

  public async mostSoldPerMonth({ request }: HttpContextContract) {
    const { month } = request.all();
    if (!month) {
      return { error: "Precisa enviar month" };
    }
    let products = await Product.all();
    let mSold: GenericReturnType[] = [];
    for (let prod of products) {
      let total = await SelledProduct.query()
        .select("*")
        .where("productId", prod.id);

      let newTotal = total.filter((item) => {
        return item.createdAt.month == month;
      });

      let tot = 0;
      for (let i in newTotal) {
        tot += newTotal[i].quantity;
      }
      mSold.push({ name: prod.name, total: tot });
    }
    let newMSold = mSold.filter((item) => item.total > 0);
    let highestToLowest = newMSold.sort((a, b) => b.total - a.total);
    let slice = highestToLowest.slice(0, 5);
    return { mSold: slice };
  }

  public async leastSold({}: HttpContextContract) {
    let products = await Product.all();
    let lSold: GenericReturnType[] = [];
    for (let prod of products) {
      let total = await SelledProduct.query()
        .select("*")
        .where("productId", prod.id);
      let tot = 0;
      for (let i in total) {
        tot += total[i].quantity;
      }
      lSold.push({ name: prod.name, total: tot });
    }

    let highestToLowest = lSold.sort((a, b) => a.total - b.total);

    return { retorno: highestToLowest };
  }
}
