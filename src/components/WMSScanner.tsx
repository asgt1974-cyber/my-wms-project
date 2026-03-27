import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Package, CheckCircle } from 'lucide-react';
import { supabase, type Item, type Inventory } from '../supabaseClient';

type UnitOfMeasure = 'Singles' | 'Cases' | 'Pallets';

interface WMSScannerProps {
  onAdminClick?: () => void;
}

export default function WMSScanner({ onAdminClick }: WMSScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [item, setItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure>('Singles');
  const [location, setLocation] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const lookupItem = async (scannedBarcode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('barcode', scannedBarcode)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setItem(data);
        setMessage({ type: 'success', text: `Item found: ${data.name}` });
      } else {
        setItem(null);
        setMessage({ type: 'error', text: 'Item not found in database' });
      }
    } catch (error) {
      console.error('Error looking up item:', error);
      setMessage({ type: 'error', text: 'Error looking up item' });
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setIsScanning(true);
      setMessage(null);

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          setBarcode(decodedText);
          await lookupItem(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setMessage({ type: 'error', text: 'Unable to access camera' });
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch(() => {
          setIsScanning(false);
        });
    }
  };

  const handleBarcodeSubmit = () => {
    if (barcode.trim()) {
      lookupItem(barcode.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !location.trim()) return;
  
    try {
      setLoading(true);
  
      // We insert and tell Supabase to "select" the new row back 
      // so we can see the URN it generated.
     // Change this part of your handleSubmit:
      const { data, error } = await supabase
      .from('inventory')
      .insert([{
          item_id: item.id,
          location: location,
          quantity: quantity,
          uom: unitOfMeasure
      }])
      .select() // This tells Supabase: "Send the whole new row back to me"
      .single();
  
      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Successfully Created LPN: ${data.urn} for ${quantity} ${unitOfMeasure}`
      });
  
      // Clear form
      setBarcode('');
      setItem(null);
      setLocation('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-white" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Warehouse Management
                </h1>
              </div>
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-semibold text-sm"
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {message && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                <p className="flex-1">{message.text}</p>
                <button
                  onClick={() => setMessage(null)}
                  className="text-current hover:opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Barcode / SKU
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
                  placeholder="Enter or scan barcode"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading || isScanning}
                />
                <button
                  type="button"
                  onClick={handleBarcodeSubmit}
                  disabled={loading || isScanning || !barcode.trim()}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                >
                  Lookup
                </button>
                {!isScanning ? (
                  <button
                    type="button"
                    onClick={startScanner}
                    disabled={loading}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {isScanning && (
              <div ref={scannerContainerRef} className="space-y-2">
                <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-blue-500"></div>
                <p className="text-sm text-gray-600 text-center">
                  Position barcode within the frame
                </p>
              </div>
            )}

            {item && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Item Details</h3>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Name:</span> {item.name}
                </p>
                {item.description && (
                  <p className="text-sm text-blue-800 mt-1">
                    <span className="font-medium">Description:</span> {item.description}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Unit of Measure
                  </label>
                  <select
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value as UnitOfMeasure)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                    disabled={loading}
                  >
                    <option value="Singles">Singles</option>
                    <option value="Cases">Cases</option>
                    <option value="Pallets">Pallets</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., A-12-3 or Shelf B"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !item}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {loading ? 'Processing...' : 'Submit to Inventory'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
