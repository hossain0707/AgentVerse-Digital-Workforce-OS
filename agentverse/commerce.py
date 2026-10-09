"""Transactional prototype commerce primitives (all amounts are non-cash demo credits).

No processor, escrow, or real transfer of funds is connected. This module keeps
ownership movement and allocation calculations consistent across sales and buyouts.
"""
from __future__ import annotations


def quote_sale(connection, agent_id: str, seller_id: str, buyer_id: str, amount: int) -> dict:
    """Allocate a proposed sale: 10% platform, up to 5% verified trainer pool."""
    fee = amount * 10 // 100
    pool = amount * 5 // 100
    contributors = connection.execute(
        """SELECT trainer_id, SUM(credits) AS credits FROM training
           WHERE agent_id=? AND status='verified' GROUP BY trainer_id""", (agent_id,)
    ).fetchall()
    contributors = [r for r in contributors if r['trainer_id'] not in (seller_id, buyer_id)]
    denominator = sum(r['credits'] for r in contributors)
    payouts = {}
    if denominator:
        for row in contributors:
            part = pool * row['credits'] // denominator
            if part:
                payouts[row['trainer_id']] = part
    seller_proceeds = amount - fee - sum(payouts.values())
    assert seller_proceeds >= 0
    return {'gross': amount, 'platform_fee': fee, 'trainer_rewards': payouts,
            'seller_proceeds': seller_proceeds, 'cash_transferred': False,
            'currency': 'DEMO_CREDITS', 'price_is_real': False}