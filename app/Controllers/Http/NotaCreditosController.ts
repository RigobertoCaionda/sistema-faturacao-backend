import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import NotaCredito from "App/Models/NotaCredito";
import Product from "App/Models/Product";
import SelledProduct from "App/Models/SelledProduct";
import Venda from "App/Models/Venda";

export default class NotaCreditosController {
  public async notaCredito({}: HttpContextContract) {
    //const { vendaId, selledProductId, quantity } = request.all(); // Quantity refere-se a quantidade que ele quer diminuir
    const data = [
      { vendaId: 1, selledProductId: 1, quantity: 2 },
      { vendaId: 1, selledProductId: 1, quantity: 2 },
    ]; // Nao aceitar que se faca nota de credito de tabelas diferentes. Devera ter na tabela notaCredito a prop valorRetirado para sabermos quantos kz foi descontado e ao imprimir a nota de credito, tal como na fatura, vamos ter o total descontado por notaCredito. So os adm fazem notaCredito
    if (data.length > 0) {
      for (let i in data) {
        if (!data[i].vendaId) {
          return { error: "Id da venda inválido!" };
        }

        if (!data[i].selledProductId) {
          return { error: "Id do selledProduct inválido!" };
        }

        if (!data[i].quantity) {
          return { error: "Quantidade inválido!" };
        }

        let venda = await Venda.find(data[i].vendaId);
        if (!venda) {
          return { error: "Essa venda não existe" };
        }
        let selledProduct = await SelledProduct.find(data[i].selledProductId);
        if (!selledProduct) {
          return { error: "Nenhum produto com este id foi vendido" };
        }

        let novaNotaCredito = await NotaCredito.create(data[i]);
        let product = await Product.find(selledProduct.productId); // Depois que ja criou a nota de credito, agora preciso alterar o stock do produto
        if (!product) {
          return { error: "Produto não encontrado" };
        }
        let stock = product.stock + data[i].quantity;
        product.merge({ stock });
        await product.save();
        let notaCredito = await NotaCredito.query().where(
          "vendaId",
          novaNotaCredito.vendaId
        );
        let retornoDaNotaCredito: any = [];
        for (let i in notaCredito) {
          retornoDaNotaCredito.push({
            idNotaCredito: notaCredito[i].id,
            idVenda: notaCredito[i].vendaId,
            nomeProduto: notaCredito[i].selledProductId,
            quantidade: notaCredito[i].quantity,
          }); // Retirar esse selledProductId e retornar o nome, acrescentar o preco que foi descontado, vai depois aparecer o total descontado
        }

        return { notaCredito: retornoDaNotaCredito };
      }
    } else {
      return { error: "Precisa enviar um array com os dados." };
    }
  }
}
