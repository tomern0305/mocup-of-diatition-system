import React, { useState, useMemo } from 'react';
import LineWorkerProductCard from './LineWorkerProductCard';
import { ALLERGENS, CONSISTENCIES } from '../constants';

export default function LineWorkerCatalog({ products }) {
    const [selectedAllergens, setSelectedAllergens] = useState(new Set());
    const [selectedConsistencies, setSelectedConsistencies] = useState(new Set());

    const toggleAllergen = (allergen) => {
        const next = new Set(selectedAllergens);
        if (next.has(allergen)) next.delete(allergen);
        else next.add(allergen);
        setSelectedAllergens(next);
    };

    const toggleConsistency = (consistency) => {
        const next = new Set(selectedConsistencies);
        if (next.has(consistency)) next.delete(consistency);
        else next.add(consistency);
        setSelectedConsistencies(next);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Safety Filter (Allergens) - HIDE if contains selected allergen
            if (selectedAllergens.size > 0) {
                for (const allergen of product.allergens) {
                    if (selectedAllergens.has(allergen)) return false;
                }
            }

            // 2. Consistency Filter - SHOW if matches selected consistency (if any selected)
            if (selectedConsistencies.size > 0) {
                const hasMatch = product.consistency.some(c => selectedConsistencies.has(c));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [products, selectedAllergens, selectedConsistencies]);

    const groupedProducts = useMemo(() => {
        const groups = {};
        if (filteredProducts.length === 0) return {};

        filteredProducts.forEach(product => {
            const category = product.subCategory || "Uncategorized";
            if (!groups[category]) groups[category] = [];
            groups[category].push(product);
        });
        return groups;
    }, [filteredProducts]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {/* Horizontal Filter Belt */}
            <div style={{
                background: 'white', padding: '1.5rem', borderBottom: '1px solid #e2e8f0',
                overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexShrink: 0
            }}>
                {/* Consistencies Group */}
                <div style={{ display: 'flex', gap: '1rem', paddingRight: '1rem', borderRight: '1px solid #cbd5e1' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', marginRight: '0.5rem' }}>CONSISTENCY:</span>
                    {Object.values(CONSISTENCIES).map(cons => (
                        <button
                            key={cons}
                            onClick={() => toggleConsistency(cons)}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                border: '2px solid',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: selectedConsistencies.has(cons) ? '#dcfce7' : 'white',
                                borderColor: selectedConsistencies.has(cons) ? '#166534' : '#e2e8f0',
                                color: selectedConsistencies.has(cons) ? '#166534' : '#64748b',
                                boxShadow: selectedConsistencies.has(cons) ? '0 4px 6px -1px rgba(22, 101, 52, 0.2)' : 'none'
                            }}
                        >
                            {cons}
                        </button>
                    ))}
                </div>

                {/* Allergens Group */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', marginRight: '0.5rem' }}>HIDE ALLERGENS:</span>
                    {Object.values(ALLERGENS).map(allergen => (
                        <button
                            key={allergen}
                            onClick={() => toggleAllergen(allergen)}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                border: '2px solid',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: selectedAllergens.has(allergen) ? '#fee2e2' : 'white',
                                borderColor: selectedAllergens.has(allergen) ? '#dc2626' : '#e2e8f0',
                                color: selectedAllergens.has(allergen) ? '#991b1b' : '#64748b',
                                textDecoration: selectedAllergens.has(allergen) ? 'line-through' : 'none',
                                opacity: selectedAllergens.has(allergen) ? 0.8 : 1,
                                boxShadow: selectedAllergens.has(allergen) ? '0 4px 6px -1px rgba(220, 38, 38, 0.2)' : 'none'
                            }}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                {Object.keys(groupedProducts).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '1.25rem' }}>
                        No products match the selected criteria.
                    </div>
                ) : (
                    Object.entries(groupedProducts).map(([category, items]) => (
                        <div key={category} style={{ marginBottom: '3rem' }}>
                            <h2 style={{
                                fontSize: '1.5rem', fontWeight: 800, color: '#334155',
                                marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0',
                                paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                {category}
                                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                    {items.length}
                                </span>
                            </h2>
                            <div className="product-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {items.map(product => (
                                    <LineWorkerProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
