import { RestaurantStore } from './store';

describe('flujo de entrega delivery', () => {
  beforeEach(() => {
    localStorage.removeItem('sazon-orders');
    localStorage.removeItem('sazon-users');
    localStorage.removeItem('sazon-notifications');
  });
  afterEach(() => {
    localStorage.removeItem('sazon-orders');
    localStorage.removeItem('sazon-users');
    localStorage.removeItem('sazon-notifications');
  });

  it('recibe, prepara, asigna, despacha y completa el pedido', () => {
    const store = new RestaurantStore();
    const order = store.createDeliveryOrder('Ana Ruiz', [{ dishId: 1, name: 'Lomo Saltado', price: 32, quantity: 1 }], {
      phone: '987654321', district: 'Miraflores', address: 'Calle Los Pinos 123', reference: 'Puerta azul', instructions: 'Llamar al llegar', fee: 7,
    });
    expect(order.delivery?.status).toBe('Por preparar');
    expect(store.assignDeliveryDriver(order.id, 103)).toBeFalse();
    store.updateOrderStatus(order.id, 'Preparando');
    expect(store.orders().find(item => item.id === order.id)?.delivery?.status).toBe('Preparando');
    store.updateOrderStatus(order.id, 'Listo');
    expect(store.orders().find(item => item.id === order.id)?.delivery?.status).toBe('Por asignar');
    expect(store.assignDeliveryDriver(order.id, 103)).toBeTrue();
    expect(store.availableDrivers().some(driver => driver.id === 103)).toBeFalse();
    expect(store.dispatchDelivery(order.id)).toBeTrue();
    expect(store.completeDelivery(order.id)).toBeTrue();
    expect(store.orders().find(item => item.id === order.id)?.delivery?.status).toBe('Entregado');
    expect(store.availableDrivers().some(driver => driver.id === 103)).toBeTrue();
  });
});
