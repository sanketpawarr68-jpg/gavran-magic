import React from 'react';

const RefundPolicy = () => {
    return (
        <main className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: '"Inter", sans-serif', lineHeight: '1.6' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', color: '#1a1a1a' }}>Refund and Return Policy</h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>1. Order Cancellations</h2>
                <div style={{ background: '#fffbf5', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#b45309', marginBottom: '10px' }}><i className="fas fa-exclamation-triangle"></i> Important Deadline</h3>
                    <p style={{ margin: 0, color: '#92400e' }}>If you buy any product, you can cancel it <strong>ONLY within 2 to 3 hours</strong> of placing the order. After 3 hours, the order is deemed confirmed and enters the manufacturing/packaging stage. You cannot cancel the product after this window.</p>
                </div>
                <p>To cancel an order within the allowed timeframe, please contact our customer support immediately via phone or email with your Order ID.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>2. Returns</h2>
                <p>Because Gavran Magic products are fresh, homemade food items, we cannot accept general returns for buyer's remorse or change of mind in order to maintain hygiene standards.</p>
                <p>We only process returns, replacements, or refunds if:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li>The product arrives severely damaged or in a compromised state.</li>
                    <li>The wrong product was delivered to you by mistake.</li>
                </ul>
                <p>For any of these issues, you must contact us with a clear photo of the received package within <strong>24 hours</strong> of delivery.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>3. Refunds</h2>
                <p>Once your return issue is inspected and verified, we will send you an email to notify you of the approval or rejection of your refund.</p>
                <p>If approved, your refund will be processed and automatically applied to your original method of payment (UPI, Credit Card, etc.) within 5-7 business days.</p>
            </section>
        </main>
    );
};

export default RefundPolicy;
