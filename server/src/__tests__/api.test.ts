import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Sathuragiri Decoration - Portfolio & Admin API Test Suite', () => {
  let authToken = '';
  let testCategoryId = '';
  let testProjectId = '';

  describe('1. Health and Public Website APIs', () => {
    it('GET /health should return 200 OK with Sathuragiri Decoration business info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business).toBe('Sathuragiri Decoration');
      expect(res.body.data.tagline).toBe('Every Celebration, Beautifully Crafted.');
    });

    it('GET /api/categories should return all active event categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      // All public categories must be active
      res.body.data.forEach((cat: any) => {
        expect(cat.is_active).toBe(true);
      });
    });

    it('GET /api/categories/:slug should return category details and published projects', async () => {
      const res = await request(app).get('/api/categories/wedding-decoration');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('wedding-decoration');
      expect(Array.isArray(res.body.data.projects)).toBe(true);
    });

    it('GET /api/portfolio should return published portfolio projects with images', async () => {
      const res = await request(app).get('/api/portfolio');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const proj = res.body.data[0];
      expect(proj.title).toBeDefined();
      expect(proj.status).toBe('published');
      expect(Array.isArray(proj.images)).toBe(true);
    });

    it('GET /api/portfolio/:slug should return a single project with multiple photographs', async () => {
      const res = await request(app).get('/api/portfolio/royal-chettinad-kalyana-mandapam');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('royal-chettinad-kalyana-mandapam');
      expect(Array.isArray(res.body.data.images)).toBe(true);
    });

    it('GET /api/settings/public should return configured WhatsApp number and contact info', async () => {
      const res = await request(app).get('/api/settings/public');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_name).toBe('Sathuragiri Decoration');
      expect(res.body.data.whatsapp_number).toBeDefined();
    });
  });

  describe('2. Administrator Authentication & Authorization', () => {
    it('POST /api/admin/auth/login should reject invalid credentials', async () => {
      const res = await request(app).post('/api/admin/auth/login').send({
        email: 'admin@sathuragiridecoration.com',
        password: 'IncorrectPassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/admin/auth/login should authenticate valid admin and return JWT', async () => {
      const res = await request(app).post('/api/admin/auth/login').send({
        email: 'admin@sathuragiridecoration.com',
        password: 'Admin@12345',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@sathuragiridecoration.com');
      authToken = res.body.data.token;
    });

    it('GET /api/admin/auth/me should return admin profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });

    it('Protected endpoints should reject unauthenticated visitors', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Admin Dashboard Statistics from Supabase', () => {
    it(
      'GET /api/admin/stats should return real portfolio metrics from Supabase',
      async () => {
        const res = await request(app)
          .get('/api/admin/stats')
          .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.data.totalProjects).toBe('number');
        expect(typeof res.body.data.publishedProjects).toBe('number');
        expect(typeof res.body.data.draftProjects).toBe('number');
        expect(typeof res.body.data.activeCategories).toBe('number');
      },
      15000
    );
  });

  describe('4. Admin Category Management CRUD', () => {
    it('POST /api/admin/categories should create a new event category', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Temporary Category',
          slug: `test-cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          description: 'A test category for automated suite validation',
          cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552',
          display_order: 99,
          is_active: true,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      testCategoryId = res.body.data.id;
    });

    it('PUT /api/admin/categories/:id should update category details', async () => {
      const res = await request(app)
        .put(`/api/admin/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Category',
          display_order: 100,
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Test Category');
    });

    it('DELETE /api/admin/categories/:id should safely delete an unused category', async () => {
      const res = await request(app)
        .delete(`/api/admin/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Admin Portfolio Management CRUD', () => {
    it('POST /api/admin/portfolio should create a project with multiple photographs', async () => {
      // Fetch a valid category
      const catRes = await request(app).get('/api/categories');
      const catId = catRes.body.data[0].id;

      const res = await request(app)
        .post('/api/admin/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Automated Test Luxury Mandap',
          slug: `test-mandap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          category_id: catId,
          description: 'Test mandapam setup description',
          location: 'Madurai, Tamil Nadu',
          event_date: '2026-03-15',
          cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552',
          status: 'draft',
          display_order: 50,
          images: [
            {
              image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552',
              alt_text: 'Test Photo 1',
            },
            {
              image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
              alt_text: 'Test Photo 2',
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('draft');
      testProjectId = res.body.data.id;
    });

    it('PUT /api/admin/portfolio/:id should update and publish the project', async () => {
      const res = await request(app)
        .put(`/api/admin/portfolio/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Published Test Luxury Mandap',
          status: 'published',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('published');
    });

    it('DELETE /api/admin/portfolio/:id should delete the project and cascade photographs', async () => {
      const res = await request(app)
        .delete(`/api/admin/portfolio/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('6. Admin Settings Persistence', () => {
    it('GET and PUT /api/admin/settings should persist business settings in Supabase', async () => {
      const getRes = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${authToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);

      const putRes = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          whatsapp_number: '+919842187654',
          business_name: 'Sathuragiri Decoration',
        });
      expect(putRes.status).toBe(200);
      expect(putRes.body.success).toBe(true);
      expect(putRes.body.data.whatsapp_number).toBe('+919842187654');
    });
  });
});
