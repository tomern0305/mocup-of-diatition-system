import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { X, Search, RotateCcw } from 'lucide-react';
import MealBuilderCard from './MealBuilderCard';
import { ALLERGENS, CONSISTENCIES, SUB_CATEGORIES } from '../constants';

export default function MealBuilder({ products }) {
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [constraints, setConstraints] = useState({
        allergens: new Set(), // ITEMS CONTAINING THESE WILL BE HIDDEN
        consistency: new Set(), // IF SET, ONLY ITEMS MATCHING THESE WILL BE SHOWN
        blockMayContain: false // IF TRUE, "MAY CONTAIN" ITEMS ALSO HIDDEN
    });

    // --- Helpers ---
    const parseNutrient = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        return parseFloat(val.replace(/[^\d.]/g, '')) || 0;
    };

    // --- Logic ---
    const getProductStatus = (product) => {
        // 1. Consistency (Requirement: Must match one of selected if any selected)
        if (constraints.consistency.size > 0) {
            const hasMatch = product.consistency.some(c => constraints.consistency.has(c));
            if (!hasMatch) return { compatible: false, risky: false, riskyAllergens: [] };
        }

        // 2. Allergens
        if (constraints.allergens.size > 0) {
            // A. Check Direct Allergens (Always Incompatible)
            for (const allergen of product.allergens) {
                if (constraints.allergens.has(allergen)) return { compatible: false, risky: false, riskyAllergens: [] };
            }

            // B. Check "May Contain"
            if (product.mayContain && product.mayContain.length > 0) {
                // Determine WHICH items are risky
                const riskyAllergens = product.mayContain.filter(a => constraints.allergens.has(a));

                if (riskyAllergens.length > 0) {
                    if (constraints.blockMayContain) {
                        return { compatible: false, risky: false, riskyAllergens: [] }; // Strict Mode: Block it
                    } else {
                        return { compatible: true, risky: true, riskyAllergens }; // Permissive Mode: Allow but Warn with specific allergens
                    }
                }
            }
        }
        return { compatible: true, risky: false, riskyAllergens: [] };
    };

    const toggleProduct = (product) => {
        const status = getProductStatus(product);
        if (!status.compatible) return; // Prevent selection of incompatible items

        const next = new Set(selectedProductIds);
        if (next.has(product.id)) next.delete(product.id);
        else next.add(product.id);
        setSelectedProductIds(next);
    };

    const removeProduct = (id) => {
        const next = new Set(selectedProductIds);
        next.delete(id);
        setSelectedProductIds(next);
    };

    // --- Derived Data ---
    const selectedProducts = useMemo(() => {
        return products.filter(p => selectedProductIds.has(p.id));
    }, [products, selectedProductIds]);

    const nutritionTotals = useMemo(() => {
        const total = { Calories: 0, Protein: 0, Fat: 0, Carbs: 0, Sodium: 0, Sugar: 0 };
        selectedProducts.forEach(p => {
            total.Calories += parseNutrient(p.calories);
            total.Protein += parseNutrient(p.protein);
            total.Fat += parseNutrient(p.fat);
            total.Carbs += parseNutrient(p.carbohydrates);
            total.Sodium += parseNutrient(p.sodium);
            total.Sugar += parseNutrient(p.sugar);
        });
        // Round to 1 decimal
        Object.keys(total).forEach(k => total[k] = Math.round(total[k] * 10) / 10);
        return [
            { name: 'Cal', value: total.Calories, fill: '#3b82f6' },
            { name: 'Prot', value: total.Protein, fill: '#8b5cf6' },
            { name: 'Fat', value: total.Fat, fill: '#f59e0b' },
            { name: 'Carb', value: total.Carbs, fill: '#10b981' },
            { name: 'Sod', value: total.Sodium, fill: '#ef4444' },
            { name: 'Sugr', value: total.Sugar, fill: '#ec4899' },
        ];
    }, [selectedProducts]);

    const groupedProducts = useMemo(() => {
        const groups = {};
        products.forEach(p => {
            const cat = p.subCategory || 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [products]);

    // --- Render ---
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden' }}>

            {/* STICKY TOP BAR */}
            <div style={{
                height: '220px', background: 'white', borderBottom: '1px solid #e2e8f0',
                flexShrink: 0, display: 'flex', padding: '1rem', gap: '2rem',
                boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)', zIndex: 50
            }}>
                {/* Left: Selected Items */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Your Meal ({selectedProducts.length})
                    </h3>
                    <div style={{
                        flex: 1, background: '#f1f5f9', borderRadius: '1rem', padding: '1rem',
                        display: 'flex', gap: '1rem', overflowX: 'auto', alignItems: 'center'
                    }}>
                        {selectedProducts.length === 0 && (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Select items below to build your meal...</span>
                        )}
                        {selectedProducts.map(p => (
                            <div key={p.id} onClick={() => removeProduct(p.id)} style={{
                                background: 'white', padding: '0.5rem 1rem', borderRadius: '2rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                                fontSize: '0.9rem', fontWeight: 600, color: '#334155'
                            }}>
                                {p.name}
                                <div style={{ background: '#fee2e2', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                                    <X size={12} color="#ef4444" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Chart */}
                <div style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Live Nutrition
                    </h3>
                    <div style={{ flex: 1, fontSize: '0.75rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nutritionTotals} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={500}>
                                    {nutritionTotals.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* CONTROL PANEL & GRID */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Side: Constraints */}
                <div style={{ width: '280px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '1.5rem', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Constraints
                    </h3>

                    {/* Consistency */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Allowed Consistencies</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {Object.values(CONSISTENCIES).map(cons => (
                                <label key={cons} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={constraints.consistency.has(cons)}
                                        onChange={() => {
                                            const next = new Set(constraints.consistency);
                                            if (next.has(cons)) next.delete(cons);
                                            else next.add(cons);
                                            setConstraints({ ...constraints, consistency: next });
                                        }}
                                        style={{ width: '1.2rem', height: '1.2rem', accentColor: '#22c55e' }}
                                    />
                                    {cons}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Allergens */}
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Safety (Exclude)</h4>

                        {/* Strict Mode Toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem', background: '#fff1f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            <input
                                type="checkbox"
                                checked={constraints.blockMayContain}
                                onChange={(e) => setConstraints({ ...constraints, blockMayContain: e.target.checked })}
                                style={{ width: '1rem', height: '1rem', accentColor: '#ef4444' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, color: '#ef4444' }}>Block "May Contain"</span>
                                <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>Strict Safety Mode</span>
                            </div>
                        </label>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {Object.values(ALLERGENS).map(allergen => (
                                <label key={allergen} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={constraints.allergens.has(allergen)}
                                        onChange={() => {
                                            const next = new Set(constraints.allergens);
                                            if (next.has(allergen)) next.delete(allergen);
                                            else next.add(allergen);
                                            setConstraints({ ...constraints, allergens: next });
                                        }}
                                        style={{ width: '1.2rem', height: '1.2rem', accentColor: '#ef4444' }}
                                    />
                                    No {allergen}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main: Product Grid */}
                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {Object.entries(groupedProducts).length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '4rem' }}>No products available.</div>
                    ) : (
                        Object.entries(groupedProducts).map(([category, items]) => (
                            <div key={category} style={{ marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
                                    {category}
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {items.map(product => {
                                        const { compatible, risky, riskyAllergens } = getProductStatus(product);
                                        return (
                                            <MealBuilderCard
                                                key={product.id}
                                                product={product}
                                                isSelected={selectedProductIds.has(product.id)}
                                                onToggle={toggleProduct}
                                                isDimmed={!compatible}
                                                isRisky={risky}
                                                riskyAllergens={riskyAllergens}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
