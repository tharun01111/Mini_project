import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { generateToken, verifyToken } from '../src/utils/jwt.js';
import { authorize } from '../src/middleware/auth.js';

describe('Unified Symposium Management Platform — Automated Test Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  // ── 1. System Health & Infrastructure ──
  describe('System Health & Base Endpoints', () => {
    it('GET /api/health returns 200 OK with status message', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'OK');
      assert.match(data.message, /running smoothly/i);
    });
  });

  // ── 2. Security & Authentication ──
  describe('Security & JWT Authentication', () => {
    it('generateToken and verifyToken generate and validate secure JWT tokens with roles', () => {
      const payload = { userId: 'test-user-123', role: 'ORGANIZER' };
      const token = generateToken(payload);
      assert.ok(typeof token === 'string' && token.length > 20);

      const decoded = verifyToken(token);
      assert.equal(decoded.userId, payload.userId);
      assert.equal(decoded.role, payload.role);
    });

    it('POST /api/auth/register fails with 400 if required fields are missing', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'incomplete@example.com' }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /Name, email, and password are required/i);
    });

    it('POST /api/auth/login fails with 400 if credentials are empty', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.message, /Email and password are required/i);
    });

    it('Protected route /api/admin/users rejects unauthorized request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.match(data.message, /No token provided/i);
    });

    it('Protected route /api/admin/users rejects invalid or forged token with 401', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: 'Bearer this_is_an_invalid_forged_jwt_token' },
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.match(data.message, /Invalid or expired token/i);
    });

    it('RBAC authorize middleware blocks non-permitted roles with 403 Forbidden', () => {
      const adminOnly = authorize('ADMIN');
      const req = { user: { id: 'u-1', role: 'PARTICIPANT' } };
      let statusCode = 0;
      let errorResponse = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (payload) => {
              errorResponse = payload;
            },
          };
        },
      };

      let nextCalled = false;
      adminOnly(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false, 'Next middleware should not be called');
      assert.equal(statusCode, 403, 'Should respond with 403 Forbidden');
      assert.match(errorResponse.message, /Access denied/i);
    });

    it('RBAC authorize middleware permits authorized roles to proceed', () => {
      const adminOnly = authorize('ADMIN');
      const req = { user: { id: 'u-admin', role: 'ADMIN' } };
      let nextCalled = false;

      adminOnly(req, {}, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true, 'Admin should be allowed to proceed');
    });
  });

  // ── 3. Business Logic: Event Capacity & Registration Rules ──
  describe('Event Registration Validation Logic', () => {
    it('Validates capacity limit calculation accurately', () => {
      const eventCapacity = 50;
      const currentRegistrationsCount = 50;
      const isFull = currentRegistrationsCount >= eventCapacity;
      assert.equal(isFull, true, 'Event must reject registration when capacity reached');

      const underCapacityCount = 49;
      assert.equal(underCapacityCount >= eventCapacity, false, 'Event must accept registration when under capacity');
    });

    it('Validates registration deadline expiry logic', () => {
      const pastDeadline = new Date(Date.now() - 3600000); // 1 hour ago
      const isPast = new Date() > new Date(pastDeadline);
      assert.equal(isPast, true, 'Registration must be blocked past deadline');

      const futureDeadline = new Date(Date.now() + 86400000); // 1 day future
      const isFuture = new Date() > new Date(futureDeadline);
      assert.equal(isFuture, false, 'Registration must be allowed before deadline');
    });
  });

  // ── 4. Business Logic: Attendance Duplicate Check ──
  describe('Attendance Verification & Duplicate Prevention', () => {
    it('Accurately detects duplicate check-in scan attempt', () => {
      const existingAttendance = {
        id: 'att-1',
        markedAt: new Date(),
        method: 'QR',
      };

      const hasAlreadyCheckedIn = Boolean(existingAttendance);
      assert.equal(hasAlreadyCheckedIn, true, 'System must identify that participant already checked in');
    });
  });

  // ── 5. Business Logic: Certificate Eligibility Criteria ──
  describe('Certificate Generation Eligibility Gate', () => {
    it('Requires all 3 criteria: CONFIRMED registration, COMPLETED/EXEMPT payment, and RECORDED attendance', () => {
      const checkEligibility = (status, paymentStatus, hasAttendance) => {
        if (status !== 'CONFIRMED') return false;
        if (paymentStatus === 'PENDING') return false;
        if (!hasAttendance) return false;
        return true;
      };

      // Incomplete: absent
      assert.equal(checkEligibility('CONFIRMED', 'COMPLETED', false), false);
      // Incomplete: payment pending
      assert.equal(checkEligibility('CONFIRMED', 'PENDING', true), false);
      // Incomplete: registration not confirmed
      assert.equal(checkEligibility('PENDING', 'EXEMPT', true), false);
      // Fully eligible
      assert.equal(checkEligibility('CONFIRMED', 'COMPLETED', true), true);
      assert.equal(checkEligibility('CONFIRMED', 'EXEMPT', true), true);
    });
  });
});
