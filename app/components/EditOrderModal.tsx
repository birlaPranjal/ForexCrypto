"use client";

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Order, TradeType, TradeStatus } from '@/app/types/orders';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  onDelete?: (orderId: string) => void;
  order: Order | null;
  mode?: 'create' | 'edit';
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  order,
  mode = 'edit'
}) => {
  const [formData, setFormData] = useState<Partial<Order>>({
    symbol: '',
    quantity: 0,
    buyPrice: 0,
    sellPrice: null,
    type: TradeType.LONG,
    status: TradeStatus.OPEN,
    tradeAmount: 0,
    tradeDate: new Date(),
  });

  // Reset form when modal opens with new order data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && order) {
        setFormData(order);
      } else {
        setFormData({
          symbol: '',
          quantity: 0,
          buyPrice: 0,
          sellPrice: null,
          type: TradeType.LONG,
          status: TradeStatus.OPEN,
          tradeAmount: 0,
          tradeDate: new Date(),
        });
      }
    }
  }, [isOpen, order, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profitLoss = formData.sellPrice 
      ? (formData.sellPrice - (formData.buyPrice || 0)) * (formData.quantity || 0)
      : null;
  
    if (mode === 'create') {
      onSave({
        ...formData,
        id: '', // This will be generated by the database
        profitLoss,
        tradeDate: new Date(formData.tradeDate || new Date()),
        symbol: formData.symbol || '', // Ensure symbol is included
      } as Order);
    } else {
      onSave({
        ...formData,
        id: order?.id || '',
        profitLoss,
        tradeDate: new Date(formData.tradeDate || new Date()),
        symbol: formData.symbol || '', // Ensure symbol is included
      } as Order);
    }
  };

  const handleDelete = async () => {
    if (order?.id && onDelete) {
      await onDelete(order.id);
      onClose(); // Close the modal after deletion
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-background rounded-xl border shadow-lg">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">
              {mode === 'create' ? 'Create New Order' : 'Edit Order'}
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="p-2 hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol || ''}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Trade Date</label>
                <input
                  type="date"
                  value={formData.tradeDate ? new Date(formData.tradeDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, tradeDate: new Date(e.target.value) })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trade Amount</label>
                <input
                  type="number"
                  value={formData.tradeAmount || 0}
                  onChange={(e) => setFormData({ ...formData, tradeAmount: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Buy Price</label>
                <input
                  type="number"
                  value={formData.buyPrice || 0}
                  onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sell Price</label>
                <input
                  type="number"
                  value={formData.sellPrice || ''}
                  onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type || TradeType.LONG}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TradeType })}
                  className="w-full p-2 rounded-lg border bg-background"
                >
                  <option value={TradeType.LONG}>Long</option>
                  <option value={TradeType.SHORT}>Short</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status || TradeStatus.OPEN}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TradeStatus })}
                  className="w-full p-2 rounded-lg border bg-background"
                >
                  <option value={TradeStatus.OPEN}>Open</option>
                  <option value={TradeStatus.CLOSED}>Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {mode === 'create' ? 'Create Order' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};