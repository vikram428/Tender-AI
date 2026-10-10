import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { BOQItem, BOQCategory } from '../types/tender';
import { formatCurrency } from '../utils/calculations';
import { EmptyState } from '../components/common/EmptyState';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Filter,
  Check,
  X
} from 'lucide-react';

export const BOQManagement: React.FC = () => {
  const { activeTender, addBOQItem, updateBOQItem, deleteBOQItem, showNotification, setCurrentPage } = useTender();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  const [editQty, setEditQty] = useState<number>(0);

  // New Item Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemNumber, setNewItemNumber] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BOQCategory>('superstructure_rcc');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('cum');
  const [newItemQty, setNewItemQty] = useState<number>(100);
  const [newItemRate, setNewItemRate] = useState<number>(6500);
  const [newItemRef, setNewItemRef] = useState('CPWD DSR 2023');

  if (!activeTender) {
    return (
      <EmptyState
        title="No Active Tender Document"
        description="Select a tender from your workspace or upload a new tender document to manage its Bill of Quantities schedule."
        actionLabel="Upload New Tender"
        onAction={() => setCurrentPage('upload')}
      />
    );
  }

  const items = activeTender.boqItems || [];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.itemNumber.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.specificationRef.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const totalBOQAmount = items.reduce((sum, item) => sum + (item.quantity * item.estimatedRate), 0);
  const filteredTotal = filteredItems.reduce((sum, item) => sum + (item.quantity * item.estimatedRate), 0);

  const startEdit = (item: BOQItem) => {
    setEditingItemId(item.id);
    setEditRate(item.estimatedRate);
    setEditQty(item.quantity);
  };

  const saveEdit = (item: BOQItem) => {
    updateBOQItem(activeTender.id, {
      ...item,
      quantity: editQty,
      estimatedRate: editRate
    });
    setEditingItemId(null);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc.trim() || !newItemNumber.trim()) {
      showNotification('Please enter Item Number and Description', 'warning');
      return;
    }

    addBOQItem(activeTender.id, {
      itemNumber: newItemNumber,
      category: newItemCategory,
      description: newItemDesc,
      unit: newItemUnit,
      quantity: Number(newItemQty),
      estimatedRate: Number(newItemRate),
      specificationRef: newItemRef
    });

    setShowAddModal(false);
    // Reset form
    setNewItemDesc('');
    setNewItemNumber('');
  };

  const exportCSV = () => {
    const headers = ['Item No', 'Category', 'Description', 'Unit', 'Quantity', 'Estimated Rate (INR)', 'Total Amount (INR)', 'Specification Ref'];
    const rows = items.map(i => [
      `"${i.itemNumber}"`,
      `"${i.category}"`,
      `"${i.description.replace(/"/g, '""')}"`,
      `"${i.unit}"`,
      i.quantity,
      i.estimatedRate,
      i.quantity * i.estimatedRate,
      `"${i.specificationRef}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BOQ_${activeTender.nitNumber.replace(/[\/\\]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('BOQ Schedule exported as CSV format.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>BILL OF QUANTITIES (BOQ)</span>
            <span className="text-slate-600">/</span>
            <span>{activeTender.nitNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            BOQ Itemized Civil Works Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic rate schedule with item-level rate adjustment, quantities, and CPWD/DSR specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 block">TOTAL SCHEDULE VALUE</span>
          <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
            {formatCurrency(totalBOQAmount, activeTender.currency)}
          </span>
        </div>
        <div className="p-3 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 block">TOTAL LINE ITEMS</span>
          <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
            {items.length} Items
          </span>
        </div>
        <div className="p-3 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 block">FILTERED SUB-TOTAL</span>
          <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
            {formatCurrency(filteredTotal, activeTender.currency)}
          </span>
        </div>
        <div className="p-3 bg-[#0E1726] border border-slate-800 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 block">ESTIMATED TENDER ECPT</span>
          <span className="text-lg font-bold font-mono text-slate-300 tabular-nums">
            {formatCurrency(activeTender.estimatedCost, activeTender.currency)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0E1726] border border-slate-800 rounded-lg">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, DSR ref, specs..."
            className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Civil Categories</option>
            <option value="earthwork">Earthwork & Excavation</option>
            <option value="substructure_concrete">Substructure Concrete</option>
            <option value="superstructure_rcc">Superstructure RCC</option>
            <option value="reinforcement_steel">Reinforcement Steel (Fe500D)</option>
            <option value="brickwork_masonry">Brickwork & Masonry</option>
            <option value="finishing_plastering">Finishing & Plastering</option>
            <option value="flooring_paving">Flooring & Tiles</option>
            <option value="structural_steel">Structural Steel Trusses</option>
            <option value="plumbing_sanitary">Plumbing & Sewage</option>
          </select>
        </div>
      </div>

      {/* BOQ Items Table */}
      <div className="border border-slate-800 rounded-lg bg-[#0E1726] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-normal w-24">ITEM NO</th>
                <th className="py-2.5 px-4 font-normal">DESCRIPTION & SPECIFICATION</th>
                <th className="py-2.5 px-3 font-normal text-center w-20">UNIT</th>
                <th className="py-2.5 px-3 font-normal text-right w-28">QUANTITY</th>
                <th className="py-2.5 px-3 font-normal text-right w-32">RATE (₹)</th>
                <th className="py-2.5 px-4 font-normal text-right w-36">AMOUNT (₹)</th>
                <th className="py-2.5 px-3 font-normal text-center w-20">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredItems.map((item) => {
                const isEditing = editingItemId === item.id;
                const lineTotal = item.quantity * item.estimatedRate;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-amber-400 whitespace-nowrap align-top">
                      {item.itemNumber}
                    </td>
                    <td className="py-3 px-4 max-w-md align-top">
                      <div className="text-xs text-slate-200 leading-relaxed">
                        {item.description}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400/90 mt-1">
                        Ref: {item.specificationRef}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-center text-slate-400 uppercase align-top">
                      {item.unit}
                    </td>

                    {/* Quantity Cell (Editable) */}
                    <td className="py-3 px-3 font-mono text-right align-top tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(Number(e.target.value))}
                          className="w-24 bg-slate-900 border border-amber-400/60 rounded px-1.5 py-0.5 text-right text-xs font-mono text-slate-100"
                        />
                      ) : (
                        item.quantity.toLocaleString('en-IN')
                      )}
                    </td>

                    {/* Rate Cell (Editable) */}
                    <td className="py-3 px-3 font-mono text-right align-top tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRate}
                          onChange={(e) => setEditRate(Number(e.target.value))}
                          className="w-28 bg-slate-900 border border-amber-400/60 rounded px-1.5 py-0.5 text-right text-xs font-mono text-slate-100"
                        />
                      ) : (
                        `₹ ${item.estimatedRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 font-mono text-right align-top text-amber-400 font-semibold tabular-nums whitespace-nowrap">
                      {isEditing ? (
                        formatCurrency(editQty * editRate, 'INR')
                      ) : (
                        formatCurrency(lineTotal, 'INR')
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-3 text-center align-top whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(item)}
                            className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-800 rounded transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                            title="Edit Rate / Quantity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBOQItem(activeTender.id, item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Delete Line Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs font-mono">
                    No matching BOQ line items found for criteria "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1726] border border-slate-700 rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100">
                Append New Civil BOQ Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">ITEM NO</label>
                  <input
                    type="text"
                    value={newItemNumber}
                    onChange={(e) => setNewItemNumber(e.target.value)}
                    placeholder="e.g. 05.02.04"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">CATEGORY</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  >
                    <option value="earthwork">Earthwork</option>
                    <option value="substructure_concrete">Substructure Concrete</option>
                    <option value="superstructure_rcc">Superstructure RCC</option>
                    <option value="reinforcement_steel">Reinforcement Steel</option>
                    <option value="brickwork_masonry">Brickwork Masonry</option>
                    <option value="finishing_plastering">Finishing Plaster</option>
                    <option value="flooring_paving">Flooring & Tiles</option>
                    <option value="structural_steel">Structural Steel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">DESCRIPTION</label>
                <textarea
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Detailed technical specification as per CPWD DSR / MoRTH..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">UNIT</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="cum / MT / sqm"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">QUANTITY</label>
                  <input
                    type="number"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">ESTIMATED RATE (₹)</label>
                  <input
                    type="number"
                    value={newItemRate}
                    onChange={(e) => setNewItemRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">SPECIFICATION REFERENCE</label>
                <input
                  type="text"
                  value={newItemRef}
                  onChange={(e) => setNewItemRef(e.target.value)}
                  placeholder="e.g. CPWD DSR 2023 Item 5.2.1"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded"
                >
                  Append Line Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
