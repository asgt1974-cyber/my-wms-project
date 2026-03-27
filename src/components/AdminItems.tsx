import { useState, useEffect } from 'react';
import { Trash2, CreditCard as Edit2, Plus, Search, ChevronLeft } from 'lucide-react';
import { supabase, type Item } from '../supabaseClient';

interface AdminItemsProps {
  onBack: () => void;
}

type Item = {
  id: string;
  barcode: string;
  name: string;
  description: string;
  singles_barcode: string;
  case_barcode: string;
  pallet_barcode: string;
  created_at: string;
};

export default function AdminItems({ onBack }: AdminItemsProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    description: '',
    singles_barcode: '',
    case_barcode: '',
    pallet_barcode: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setMessage({ type: 'error', text: 'Failed to load items' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.barcode.trim()) {
      setMessage({ type: 'error', text: 'Name and Barcode are required' });
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        const { error } = await supabase
          .from('items')
          .update({
            name: formData.name,
            barcode: formData.barcode,
            description: formData.description,
            singles_barcode: formData.singles_barcode,
            case_barcode: formData.case_barcode,
            pallet_barcode: formData.pallet_barcode,
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Item updated successfully' });
      } else {
        const { error } = await supabase
          .from('items')
          .insert([
            {
              name: formData.name,
              barcode: formData.barcode,
              description: formData.description,
              singles_barcode: formData.singles_barcode,
              case_barcode: formData.case_barcode,
              pallet_barcode: formData.pallet_barcode,
            },
          ]);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Item created successfully' });
      }

      resetForm();
      await fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      setMessage({ type: 'error', text: 'Failed to save item' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    setFormData({
      name: item.name,
      barcode: item.barcode,
      description: item.description,
      singles_barcode: item.singles_barcode,
      case_barcode: item.case_barcode,
      pallet_barcode: item.pallet_barcode,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Item deleted successfully' });
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: 'Failed to delete item' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      description: '',
      singles_barcode: '',
      case_barcode: '',
      pallet_barcode: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-indigo-500 rounded-lg transition"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Item Master Management
                </h1>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {message && (
              <div
                className={`p-4 rounded-lg flex items-center justify-between ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <p>{message.text}</p>
                <button
                  onClick={() => setMessage(null)}
                  className="text-current hover:opacity-70"
                >
                  ×
                </button>
              </div>
            )}

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition font-semibold shadow-md"
              >
                <Plus className="w-5 h-5" />
                Add New Item
              </button>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-indigo-900 mb-4">
                  {editingId ? 'Edit Item' : 'Create New Item'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Widget A"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Primary Barcode *
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="e.g., SKU123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Singles Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.singles_barcode}
                      onChange={(e) => setFormData({ ...formData, singles_barcode: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Case Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.case_barcode}
                      onChange={(e) => setFormData({ ...formData, case_barcode: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Pallet Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.pallet_barcode}
                      onChange={(e) => setFormData({ ...formData, pallet_barcode: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                />
              </div>

              {loading && !items.length ? (
                <div className="text-center py-8 text-gray-500">
                  Loading items...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {items.length === 0 ? 'No items yet. Create one to get started.' : 'No items match your search.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Primary Barcode</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Singles</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Case</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Pallet</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, idx) => (
                        <tr key={item.id} className={`border-b border-gray-200 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-gray-500">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.barcode}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                            {item.singles_barcode || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                            {item.case_barcode || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                            {item.pallet_barcode || '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
