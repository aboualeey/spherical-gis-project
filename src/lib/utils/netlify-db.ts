import { neon } from '@netlify/neon';

// Initialize Neon client - automatically uses NETLIFY_DATABASE_URL from environment
const sql = neon();

/**
 * Example database query functions using Netlify DB with Neon
 * These functions demonstrate how to query your database directly
 */

// Example: Get all posts
export async function getAllPosts() {
  try {
    const posts = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Example: Get a specific post by ID
export async function getPostById(postId: string) {
  try {
    const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

// Example: Get all users
export async function getAllUsers() {
  try {
    const users = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Example: Get user by email
export async function getUserByEmail(email: string) {
  try {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Example: Get featured products
export async function getFeaturedProducts() {
  try {
    const products = await sql`SELECT * FROM featured_products WHERE is_active = true ORDER BY display_order ASC`;
    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
}

// Example: Get page sections
export async function getPageSections(page: string) {
  try {
    const sections = await sql`SELECT * FROM page_sections WHERE page = ${page} AND is_active = true ORDER BY display_order ASC`;
    return sections;
  } catch (error) {
    console.error('Error fetching page sections:', error);
    throw error;
  }
}

// Example: Get training programs
export async function getTrainingPrograms() {
  try {
    const programs = await sql`SELECT * FROM training_programs WHERE is_active = true ORDER BY display_order ASC`;
    return programs;
  } catch (error) {
    console.error('Error fetching training programs:', error);
    throw error;
  }
}

// Example: Create a new contact submission
export async function createContactSubmission(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  try {
    const [submission] = await sql`
      INSERT INTO contact_submissions (name, email, phone, subject, message, created_at)
      VALUES (${data.name}, ${data.email}, ${data.phone || null}, ${data.subject}, ${data.message}, NOW())
      RETURNING *
    `;
    return submission;
  } catch (error) {
    console.error('Error creating contact submission:', error);
    throw error;
  }
}

// Example: Create a new quote request
export async function createQuoteRequest(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_type: string;
  project_description: string;
  budget_range?: string;
}) {
  try {
    const [quote] = await sql`
      INSERT INTO quote_requests (name, email, phone, company, service_type, project_description, budget_range, created_at)
      VALUES (${data.name}, ${data.email}, ${data.phone || null}, ${data.company || null}, ${data.service_type}, ${data.project_description}, ${data.budget_range || null}, NOW())
      RETURNING *
    `;
    return quote;
  } catch (error) {
    console.error('Error creating quote request:', error);
    throw error;
  }
}

export { sql };