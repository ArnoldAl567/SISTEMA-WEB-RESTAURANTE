import { orderTotal, Order } from './models';

describe('cálculo de pedidos',()=>{
  it('suma cantidades y aplica el descuento sin permitir un total negativo',()=>{
    const order:Order={id:1,tableId:1,customer:'Cliente',waiter:'Mesero',createdAt:'2026-09-20',status:'Pendiente',discount:10,items:[{dishId:1,name:'Lomo Saltado',price:32,quantity:2},{dishId:2,name:'Chicha Morada',price:8,quantity:1}]};
    expect(orderTotal(order)).toBe(62);
    expect(orderTotal({...order,discount:100})).toBe(0);
  });
  it('incluye la tarifa de envío en un pedido delivery',()=>{
    const order:Order={id:2,channel:'delivery',tableId:0,customer:'Cliente',waiter:'Pedido online',createdAt:'2026-09-20',status:'Pendiente',discount:0,items:[{dishId:1,name:'Lomo Saltado',price:32,quantity:2}],delivery:{phone:'987654321',district:'Miraflores',address:'Calle 123',reference:'',instructions:'',fee:7,status:'Por preparar'}};
    expect(orderTotal(order)).toBe(71);
  });
});
