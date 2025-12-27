import React, { useMemo } from 'react';
import { Clock, AlertOctagon, Utensils, Calendar } from 'lucide-react';
import { ALLERGENS, CONSISTENCIES } from '../constants';

export default function SavedMeals({ meals, products }) {
    // Helper to get product details by ID
    const getProduct = (id) => products.find(p => p.id === id);

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    };

    if (!meals || meals.length === 0) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <Calendar size={32} color="#cbd5e1" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>No Saved Meals</h3>
                <p>Build a meal in the Meal Builder and verify it to save it here.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                {meals.map((meal) => (
                    <div key={meal.id} style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                        {/* Header: Date & Note */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: 600 }}>
                                <Clock size={14} />
                                {formatDate(meal.date)}
                            </div>
                            {meal.notes ? (
                                <p style={{ fontSize: '1.1rem', fontWeight: 500, color: '#334155', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                                    "{meal.notes}"
                                </p>
                            ) : (
                                <p style={{ fontSize: '1rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No notes</p>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

                            {/* Products List */}
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                                    Menu Items ({meal.products.length})
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {meal.products.map(id => {
                                        const product = getProduct(id);
                                        return product ? (
                                            <span key={id} style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', background: '#f1f5f9', borderRadius: '1rem', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                                {product.name}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>

                            {/* Constraints Used */}
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                                    Constraints verified
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {/* Allergens */}
                                    {meal.constraints.allergens.length > 0 && meal.constraints.allergens.map(a => (
                                        <span key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', border: '1px solid #fee2e2', fontWeight: 700 }}>
                                            <AlertOctagon size={10} /> No {a}
                                        </span>
                                    ))}

                                    {/* Consistency */}
                                    {meal.constraints.consistency.length > 0 && meal.constraints.consistency.map(c => (
                                        <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#f0fdf4', color: '#16a34a', borderRadius: '0.5rem', border: '1px solid #dcfce7', fontWeight: 700 }}>
                                            <Utensils size={10} /> {c}
                                        </span>
                                    ))}

                                    {/* Empty State */}
                                    {meal.constraints.allergens.length === 0 && meal.constraints.consistency.length === 0 && (
                                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic' }}>None applied</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
