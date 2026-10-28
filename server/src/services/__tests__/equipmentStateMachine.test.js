import { describe, it, expect } from 'vitest';
import { EQUIPMENT_STATUSES, STATUS_TRANSITIONS } from '../../models/Equipment.js';
import { assertValidTransition, applyStatusTransition } from '../equipmentStateMachine.js';
import { AppError } from '../../utils/AppError.js';

describe('equipmentStateMachine', () => {
  for (const from of EQUIPMENT_STATUSES) {
    const allowed = STATUS_TRANSITIONS[from];
    const disallowed = EQUIPMENT_STATUSES.filter((s) => s !== from && !allowed.includes(s));

    for (const to of allowed) {
      it(`allows transition ${from} -> ${to}`, () => {
        expect(() => assertValidTransition(from, to)).not.toThrow();
      });
    }

    for (const to of disallowed) {
      it(`rejects transition ${from} -> ${to}`, () => {
        expect(() => assertValidTransition(from, to)).toThrow(AppError);
        try {
          assertValidTransition(from, to);
        } catch (err) {
          expect(err.statusCode).toBe(400);
          expect(err.details.allowedNext).toEqual(allowed);
        }
      });
    }
  }

  it('applyStatusTransition mutates the document status when valid', () => {
    const doc = { status: 'in_stock' };
    applyStatusTransition(doc, 'active');
    expect(doc.status).toBe('active');
  });

  it('applyStatusTransition throws and does not mutate when invalid', () => {
    const doc = { status: 'liquidated' };
    expect(() => applyStatusTransition(doc, 'active')).toThrow(AppError);
    expect(doc.status).toBe('liquidated');
  });
});
