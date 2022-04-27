import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import NotaCredito from "App/Models/NotaCredito";
import Product from "App/Models/Product";
import SelledProduct from "App/Models/SelledProduct";
import Venda from "App/Models/Venda";

export default class NotaCreditosController {
  public async notaCredito({ auth }: HttpContextContract) {
    //const { vendaId, selledProductId, quantity } = request.all(); // Quantity refere-se a quantidade que ele quer diminuir
    const data = [
      { vendaId: 13, selledProductId: 21, quantity: 1 },
      { vendaId: 13, selledProductId: 22, quantity: 1 },
    ];
    if (!auth.user?.admin) {
      return { error: "Ação permitida apenas aos admnistradores" };
    }
    if (data.length > 0) {
      for (let i in data) {
        // Verificando se estamos descontando mais do que aquilo que se comprou
        let notaCredito = await NotaCredito.query().where(
          "selledProductId",
          data[i].selledProductId
        );
        let quantities = 0;
        for (let i in notaCredito) {
          // somando as quantidades das notasDeCredito ja feitas
          quantities += notaCredito[i].quantity;
        }
        let discount = quantities + data[i].quantity;
        let selledProduct = await SelledProduct.find(data[i].selledProductId);
        if (selledProduct) {
          if (discount > selledProduct.quantity) {
            return {
              error: `Não pode descontar mais do que aquilo que comprou (Produto ${
                parseInt(i) + 1
              })`,
            };
          }
        }
      }
      for (let i = 0; i < data.length; i++) {
        if (i < data.length - 1) {
          // Para nao dar erro de vendaId inexistente na posicao data.length
          if (data[i].vendaId !== data[i + 1].vendaId) {
            return { error: "Só permitimos nota de credito da mesma venda" };
          }
        }
      }
      let retornoDaNotaCredito: any = [];
      let totalprice = 0;
      for (let i in data) {
        if (!data[i].vendaId) {
          return { error: `Id da venda inválido (Produto ${parseInt(i) + 1})` };
        }

        if (!data[i].selledProductId) {
          return {
            error: `Id do selledProduct inválido (Produto ${parseInt(i) + 1})`,
          };
        }

        if (!data[i].quantity) {
          return { error: `Quantidade inválido (Produto ${parseInt(i) + 1})` };
        }

        let venda = await Venda.find(data[i].vendaId);
        if (!venda) {
          return {
            error: `Essa venda não existe (Produto ${parseInt(i) + 1})`,
          };
        }
        let selledProduct = await SelledProduct.find(data[i].selledProductId);
        if (!selledProduct) {
          return {
            error: `Nenhum produto com este id foi vendido (Produto ${
              parseInt(i) + 1
            })`,
          };
        }

        if (data[i].quantity > selledProduct.quantity) {
          return {
            error: `Não pode descontar uma quantidade maior que a que comprou (Produto ${
              parseInt(i) + 1
            })`,
          };
        }
        await NotaCredito.create(data[i]);
        let product = await Product.find(selledProduct.productId); // Depois que ja criou a nota de credito, agora preciso alterar o stock do produto
        if (!product) {
          return {
            error: `Produto não encontrado (Produto ${parseInt(i) + 1})`,
          };
        }
        let stock = product.stock + data[i].quantity;
        product.merge({ stock });
        await product.save();
      }
      let notaCredito = await NotaCredito.query().where(
        "vendaId",
        data[0].vendaId
      ); // Data na posicao 0 pq os ids serao os mesmos para qualquer venda, entao posso pegar apenas o id da primeira posicao

      for (let i in notaCredito) {
        let selledProduct2 = await SelledProduct.find(
          notaCredito[i].selledProductId
        );
        let product2 = await Product.find(selledProduct2?.productId);

        totalprice += notaCredito[i].quantity * selledProduct2!.price;
        retornoDaNotaCredito.push({
          idNotaCredito: notaCredito[i].id,
          idVenda: notaCredito[i].vendaId,
          nomeProduto: product2?.name,
          quantidade: notaCredito[i].quantity,
          price: notaCredito[i].quantity * selledProduct2!.price,
        });
      }

      return { notaCredito: retornoDaNotaCredito, totalprice };
    } else {
      return { error: "Precisa enviar um array com os dados." };
    }
  }
}
