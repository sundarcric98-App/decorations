import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { sanitizeCsvField } from '../utils/csv';

describe('Sathuragiri Decoration - Backend API Test Suite', () => {
  let authToken = '';

  describe('1. Health and Public Discovery APIs', () => {
    it('GET /health should return 200 OK with business info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business).toBe('Sathuragiri Decoration');
    });

    it('GET /api/v1/services should return active services list', async () => {
      const res = await request(app).get('/api/v1/services');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/packages should return event packages', async () => {
      const res = await request(app).get('/api/v1/packages');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/portfolio should return portfolio items', async () => {
      const res = await request(app).get('/api/v1/portfolio');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('2. Authentication & Authorization Security', () => {
    it('should reject login with invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@sathuragiridecoration.com',
        password: 'WrongPassword999',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully with valid admin credentials and return JWT token', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@sathuragiridecoration.com',
        password: 'Admin@12345',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('OWNER');
      expect(res.body.data.token).toBeDefined();
      authToken = res.body.data.token;
    });

    it('should reject unauthenticated access to admin endpoints', async () => {
      const res = await request(app).get('/api/v1/dashboard/kpis');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should permit authorized access to admin KPIs with bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/kpis')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis).toBeDefined();
      expect(res.body.data.kpis.totalEnquiries).toBeDefined();
      expect(res.body.data.kpis.totalRevenueReceived).toBeDefined();
    });
  });

  describe('3. Public Event Enquiry Creation', () => {
    it('should create an enquiry with reference and sanitize inputs', async () => {
      const newEnquiry = {
        name: 'Venkatesh & Ananya Wedding',
        phone: '+91 98450 77889',
        email: 'venkatesh@example.com',
        eventType: 'WEDDING',
        eventTitle: 'Traditional Tamil Brahmin Kalyanam',
        eventDate: '2026-11-15T09:00:00.000Z',
        venueName: 'Sri Raja Rajeshwari Kalyana Mahal',
        venueCity: 'Madurai',
        guestCount: 650,
        isOutdoor: false,
        budgetRange: '₹3,00,000 - ₹5,00,000',
        preferredContactMethod: 'WhatsApp',
      };

      const res = await request(app).post('/api/v1/enquiries').send(newEnquiry);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toMatch(/^ENQ-/);
      expect(res.body.data.status).toBe('NEW');
    });

    it('should reject enquiry with invalid phone number', async () => {
      const invalidEnquiry = {
        name: 'Test Customer',
        phone: '123', // invalid
        eventType: 'WEDDING',
        eventDate: '2026-11-15T09:00:00.000Z',
      };

      const res = await request(app).post('/api/v1/enquiries').send(invalidEnquiry);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Security & CSV Formula Injection Sanitization', () => {
    it('should escape dangerous formula leading characters in CSV export', () => {
      expect(sanitizeCsvField('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
      expect(sanitizeCsvField('+cmd|/c calc.exe')).toBe('"\' +cmd|/c calc.exe"'.replace(' ', ''));
      expect(sanitizeCsvField('-1000')).toBe('"\' -1000"'.replace(' ', ''));
      expect(sanitizeCsvField('@eval()')).toBe('"\' @eval()"'.replace(' ', ''));
      expect(sanitizeCsvField('Standard Wedding Mandapam')).toBe('"Standard Wedding Mandapam"');
    });
  });
});
