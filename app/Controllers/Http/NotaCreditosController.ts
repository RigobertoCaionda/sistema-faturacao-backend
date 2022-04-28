import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import NotaCredito from "App/Models/NotaCredito";
import Product from "App/Models/Product";
import SelledProduct from "App/Models/SelledProduct";
import Venda from "App/Models/Venda";

export default class NotaCreditosController {
  public async notaCredito({ auth }: HttpContextContract) {
    //const { vendaId, selledProductId, quantity } = request.all(); // Quantity refere-se a quantidade que o cliente quer retirar
    const data = [
      { vendaId: 15, selledProductId: 234, quantity: 1 },
      { vendaId: 15, selledProductId: 2467, quantity: 1 },
    ];
    /* OBS: No array data eu tenho a ordem dos objetos, comecando de cima para baixo, logo, se der errado no
    objeto de selledProductId x, quer dizer que todos acima dele derao certo, entao so precisarei repetir dele
    para baixo, pegando o idVenda e o selledProductId eu consigo repetir ele. E tmbm consigo saber quais derao
    certo pegando todos os registros com esseIdVenda e juntando em uma unica notaCredito, entao nos erros eu devo
    enviar o data para o funcionario ver a ordem, saber quem deve repetir e quais derao certo..
    Quando da errado, vc vai pegar o idVenda (Que aparecera no json), vai pegar no selledProductId desse produto
    e vai repetir. Depois é só fazer uma unica fatura com os que derao certo.
    */
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
              }, com selledProductId de ${data[i].selledProductId})`,
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
          return {
            error: `Id da venda inválido (Produto ${
              parseInt(i) + 1
            }), com selledProductId de ${data[i].selledProductId}`,
            data,
          };
        }

        if (!data[i].selledProductId) {
          return {
            error: `Id do selledProduct inválido (Produto ${
              parseInt(i) + 1
            }), com selledProductId de ${data[i].selledProductId}`,
            data,
          };
        }

        if (!data[i].quantity) {
          return {
            error: `Quantidade inválido (Produto ${
              parseInt(i) + 1
            }), com selledProductId de ${data[i].selledProductId}`,
            data,
          };
        }

        let venda = await Venda.find(data[i].vendaId);
        if (!venda) {
          return {
            error: `Essa venda não existe (Produto ${
              parseInt(i) + 1
            }), com selledProductId de ${data[i].selledProductId}`,
            data,
          };
        }
        let selledProduct = await SelledProduct.find(data[i].selledProductId);
        if (!selledProduct) {
          return {
            error: `Nenhum produto com este id foi vendido (Produto ${
              parseInt(i) + 1
            }), com selledProductId de ${data[i].selledProductId}`,
            data,
          };
        }

        if (data[i].quantity > selledProduct.quantity) {
          return {
            error: `Não pode descontar uma quantidade maior que a que comprou (Produto ${
              parseInt(i) + 1
            }), com selledProductId de ${data[i].selledProductId}`,
            data,
          };
        }
        await NotaCredito.create(data[i]);
        let product = await Product.find(selledProduct.productId);
        if (!product) {
          return {
            error: `Produto não encontrado (Produto ${
              parseInt(i) + 1
            }), com selledProductId de ${data[i].selledProductId}`,
            data,
          };
        }
        let stock = product.stock + data[i].quantity;
        product.merge({ stock });
        await product.save();
      }
      let notaCredito = await NotaCredito.query().where(
        "vendaId",
        data[0].vendaId
      ); // Já que todos vendaIds serao os mesmos, posso simplesmente pegar o primeiro

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

  public async consultarNotaCredito({ request }: HttpContextContract) {
    const { vendaId } = request.all();
    if (!vendaId) {
      return { error: "Precisa enviar vendaId" };
    }
    let notaCredito = await NotaCredito.query().where("vendaId", vendaId);
    if (notaCredito.length <= 0) {
      return { error: "Não existem notas de crédito com esse idVenda" };
    }
    let newNotaCredito: any = [];
    let totalPrice = 0;
    for (let nota of notaCredito) {
      let selledProduct = await SelledProduct.find(nota.selledProductId);
      if (!selledProduct) {
        return { error: "Nunca vendemos um produto com este id." };
      }
      let product = await Product.find(selledProduct.productId);
      totalPrice += selledProduct.price * nota.quantity;
      newNotaCredito.push({
        idNotaCredito: nota.id,
        quantity: nota.quantity,
        idVenda: nota.vendaId,
        selledProductId: nota.selledProductId,
        productName: product?.name,
        price: selledProduct.price,
        priceTotal: selledProduct.price * nota.quantity,
      });
    }
    return { data: { notaCredito: newNotaCredito, totalPrice } };
  }
}
// Caso der erro no primeiro, temos que repetir tudo, se nao der erro no primeiro, repetimos apenas a partir de onde deu erro (referente a funcao notaCredito).
