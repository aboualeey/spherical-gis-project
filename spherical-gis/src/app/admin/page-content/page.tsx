'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaSave, FaImage, FaList } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorHandler, useApiCall } from '@/lib/hooks/useErrorHandler';
import { useFormValidation, commonRules } from '@/lib/hooks/useFormValidation';

interface PageSection {
  id: string;
  page: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  isActive: boolean;
  order: number;
}

interface FeaturedProduct {
  id: string;
  productId: string;
  page: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category: string;
  };
}

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: number;
  currency: string;
  features: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  maxStudents?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

const PAGES = [
  { value: 'home', label: 'Home Page' },
  { value: 'services', label: 'Services Page' },
  { value: 'products', label: 'Products Page' },
  { value: 'training', label: 'Training Page' },
  { value: 'about', label: 'About Page' },
  { value: 'contact', label: 'Contact Page' }
];

const SECTIONS = {
  home: ['carousel', 'featured_products', 'hero_section', 'services_preview'],
  services: ['carousel', 'services_list', 'testimonials'],
  products: ['carousel', 'solar_materials', 'quote_section'],
  training: ['carousel', 'training_programs', 'certification_info'],
  about: ['carousel', 'company_info', 'team_section'],
  contact: ['carousel', 'contact_form', 'location_info']
};

export default function PageContentManagement() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [activeTab, setActiveTab] = useState('sections');
  const [pageSections, setPageSections] = useState<PageSection[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  // Enhanced error handling
  const { handleError } = useErrorHandler();
  const { loading, execute: executeApiCall } = useApiCall();

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form validation for section form
  const sectionFormValidation = useFormValidation(
    {
      section: '',
      title: '',
      subtitle: '',
      content: '',
      isActive: true,
      order: 0
    },
    {
      section: {
        rules: { ...commonRules.required },
        label: 'Section Type'
      },
      title: {
        rules: { maxLength: 100 },
        label: 'Title'
      },
      subtitle: {
        rules: { maxLength: 200 },
        label: 'Subtitle'
      },
      content: {
        rules: { maxLength: 2000 },
        label: 'Content'
      },
      order: {
        rules: { required: true, number: true, min: 0 },
        label: 'Order'
      }
    }
  );

  const [sectionForm, setSectionForm] = [sectionFormValidation.values, sectionFormValidation.setValues];

  const [featuredForm, setFeaturedForm] = useState({
    productId: '',
    title: '',
    description: '',
    imageUrl: '',
    order: 0,
    isActive: true
  });

  const [trainingForm, setTrainingForm] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    price: 0,
    currency: 'USD',
    features: '',
    imageUrl: '',
    isActive: true,
    order: 0,
    maxStudents: undefined
  });

  useEffect(() => {
    fetchPageContent();
    fetchAvailableProducts();
  }, [selectedPage]);

  const fetchPageContent = async () => {
    await executeApiCall(
      async () => {
        // Fetch page sections
        const sectionsRes = await fetch(`/api/page-sections?page=${selectedPage}`);
        if (!sectionsRes.ok) {
          throw new Error(`Failed to fetch page sections: ${sectionsRes.status}`);
        }
        const sections = await sectionsRes.json();
        setPageSections(sections);

        // Fetch featured products
        const featuredRes = await fetch(`/api/featured-products?page=${selectedPage}`);
        if (!featuredRes.ok) {
          throw new Error(`Failed to fetch featured products: ${featuredRes.status}`);
        }
        const featured = await featuredRes.json();
        setFeaturedProducts(featured);

        // Fetch training programs (only for training page)
        if (selectedPage === 'training') {
          const trainingRes = await fetch('/api/training-programs?active=true');
          if (!trainingRes.ok) {
            throw new Error(`Failed to fetch training programs: ${trainingRes.status}`);
          }
          const training = await trainingRes.json();
          setTrainingPrograms(training);
        }

        return { sections, featured };
      },
      {
        errorMessage: 'Failed to load page content. Please try again.',
        successMessage: 'Page content loaded successfully'
      }
    );
  };

  const fetchAvailableProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const products = await res.json();
        setAvailableProducts(products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Section management functions
  const handleSectionSubmit = sectionFormValidation.handleSubmit(async (values) => {
    await executeApiCall(
      async () => {
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem 
          ? `/api/page-sections/${editingItem.id}`
          : '/api/page-sections';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            page: selectedPage,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to save section: ${response.status}`);
        }

        const result = await response.json();
        return result;
      },
      {
        onSuccess: () => {
          setShowSectionModal(false);
          sectionFormValidation.reset();
          setEditingItem(null);
          fetchPageContent();
        },
        successMessage: `Section ${editingItem ? 'updated' : 'created'} successfully`,
        errorMessage: 'Failed to save section. Please check your input and try again.'
      }
    );
  });

  const handleFeaturedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/featured-products';
      const method = editingItem ? 'PUT' : 'POST';
      const data = {
        ...featuredForm,
        page: selectedPage,
        ...(editingItem && { id: editingItem.id })
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast.success(editingItem ? 'Featured product updated!' : 'Featured product added!');
        setShowFeaturedModal(false);
        resetFeaturedForm();
        fetchPageContent();
      } else {
        throw new Error('Failed to save featured product');
      }
    } catch (error) {
      console.error('Error saving featured product:', error);
      toast.error('Failed to save featured product');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/training-programs';
      const method = editingItem ? 'PUT' : 'POST';
      const data = {
        ...trainingForm,
        features: JSON.stringify(trainingForm.features.split(',').map(f => f.trim())),
        ...(editingItem && { id: editingItem.id })
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast.success(editingItem ? 'Training program updated!' : 'Training program created!');
        setShowTrainingModal(false);
        resetTrainingForm();
        fetchPageContent();
      } else {
        throw new Error('Failed to save training program');
      }
    } catch (error) {
      console.error('Error saving training program:', error);
      toast.error('Failed to save training program');
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const res = await fetch(`/api/page-sections?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Section deleted!');
        fetchPageContent();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  const deleteFeaturedProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this featured product?')) return;

    try {
      const res = await fetch(`/api/featured-products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Featured product removed!');
        fetchPageContent();
      }
    } catch (error) {
      console.error('Error deleting featured product:', error);
      toast.error('Failed to remove featured product');
    }
  };

  const deleteTrainingProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training program?')) return;

    try {
      const res = await fetch(`/api/training-programs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Training program deleted!');
        fetchPageContent();
      }
    } catch (error) {
      console.error('Error deleting training program:', error);
      toast.error('Failed to delete training program');
    }
  };

  // Reset form functions
  const resetSectionForm = () => {
    setSectionForm({
      section: '',
      title: '',
      subtitle: '',
      content: '',
      isActive: true,
      order: 0
    });
    setEditingItem(null);
  };

  const resetFeaturedForm = () => {
    setFeaturedForm({
      productId: '',
      title: '',
      description: '',
      imageUrl: '',
      order: 0,
      isActive: true
    });
    setEditingItem(null);
  };

  const resetTrainingForm = () => {
    setTrainingForm({
      title: '',
      description: '',
      duration: '',
      level: 'beginner',
      price: 0,
      currency: 'USD',
      features: '',
      imageUrl: '',
      isActive: true,
      order: 0,
      maxStudents: undefined
    });
    setEditingItem(null);
  };

  // Edit functions
  const editSection = (section: PageSection) => {
    setSectionForm({
      section: section.section,
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || '',
      isActive: section.isActive,
      order: section.order
    });
    setEditingItem(section);
    setShowSectionModal(true);
  };

  const editFeaturedProduct = (featured: FeaturedProduct) => {
    setFeaturedForm({
      productId: featured.productId,
      title: featured.title || '',
      description: featured.description || '',
      imageUrl: featured.imageUrl || '',
      order: featured.order,
      isActive: featured.isActive
    });
    setEditingItem(featured);
    setShowFeaturedModal(true);
  };

  const editTrainingProgram = (training: TrainingProgram) => {
    setTrainingForm({
      title: training.title,
      description: training.description,
      duration: training.duration,
      level: training.level,
      price: training.price,
      currency: training.currency,
      features: JSON.parse(training.features).join(', '),
      imageUrl: training.imageUrl || '',
      isActive: training.isActive,
      order: training.order,
      maxStudents: training.maxStudents
    });
    setEditingItem(training);
    setShowTrainingModal(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Page Content Management</h1>
        </div>

        {/* Page Selector */}
        <div className="bg-white p-6 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Page to Edit
          </label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGES.map(page => (
              <option key={page.value} value={page.value}>
                {page.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <SectionErrorBoundary>
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('sections')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sections'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaList className="inline mr-2" />
                  Page Sections
                </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'featured'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaImage className="inline mr-2" />
                Featured Products
              </button>
              {selectedPage === 'training' && (
                <button
                  onClick={() => setActiveTab('training')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'training'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaList className="inline mr-2" />
                  Training Programs
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading content...</p>
              </div>
            ) : (
              <>
                {/* Page Sections Tab */}
                {activeTab === 'sections' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Page Sections for {PAGES.find(p => p.value === selectedPage)?.label}</h2>
                      <button
                        onClick={() => {
                          resetSectionForm();
                          setShowSectionModal(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        <FaPlus className="mr-2" /> Add Section
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {pageSections.map((section) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{section.section.replace('_', ' ').toUpperCase()}</h3>
                              {section.title && <p className="text-gray-600 mt-1">{section.title}</p>}
                              {section.subtitle && <p className="text-gray-500 text-sm mt-1">{section.subtitle}</p>}
                              <div className="flex items-center mt-2 space-x-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  section.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {section.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-sm text-gray-500">Order: {section.order}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editSection(section)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteSection(section.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {pageSections.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FaList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No sections found for this page.</p>
                        <p className="text-sm">Add your first section to get started.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Featured Products Tab */}
                {activeTab === 'featured' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Featured Products for {PAGES.find(p => p.value === selectedPage)?.label}</h2>
                      <button
                        onClick={() => {
                          resetFeaturedForm();
                          setShowFeaturedModal(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        <FaPlus className="mr-2" /> Add Featured Product
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {featuredProducts.map((featured) => (
                        <div key={featured.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{featured.title || featured.product.name}</h3>
                              <p className="text-gray-600 mt-1">{featured.description || featured.product.description}</p>
                              <p className="text-blue-600 font-semibold mt-1">${featured.product.price}</p>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  featured.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {featured.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-sm text-gray-500">Order: {featured.order}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editFeaturedProduct(featured)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteFeaturedProduct(featured.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {featuredProducts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No featured products found for this page.</p>
                        <p className="text-sm">Add your first featured product to get started.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Training Programs Tab */}
                {activeTab === 'training' && selectedPage === 'training' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Training Programs</h2>
                      <button
                        onClick={() => {
                          resetTrainingForm();
                          setShowTrainingModal(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        <FaPlus className="mr-2" /> Add Training Program
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {trainingPrograms.map((training) => (
                        <div key={training.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{training.title}</h3>
                              <p className="text-gray-600 mt-1">{training.description}</p>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className="text-sm text-gray-500">Duration: {training.duration}</span>
                                <span className="text-sm text-gray-500">Level: {training.level}</span>
                                <span className="text-blue-600 font-semibold">${training.price} {training.currency}</span>
                              </div>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  training.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {training.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-sm text-gray-500">Order: {training.order}</span>
                                {training.maxStudents && (
                                  <span className="text-sm text-gray-500">Max Students: {training.maxStudents}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editTrainingProgram(training)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteTrainingProgram(training.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {trainingPrograms.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FaList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No training programs found.</p>
                        <p className="text-sm">Add your first training program to get started.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </SectionErrorBoundary>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Section' : 'Add New Section'}
            </h2>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Type
                </label>
                <select
                  value={sectionForm.section}
                  onChange={(e) => setSectionForm({ ...sectionForm, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select section type</option>
                  {SECTIONS[selectedPage as keyof typeof SECTIONS]?.map(section => (
                    <option key={section} value={section}>
                      {section.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={sectionFormValidation.values.title}
                  onChange={(e) => {
                    sectionFormValidation.setValue('title', e.target.value);
                    sectionFormValidation.setTouched('title');
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    sectionFormValidation.errors.title && sectionFormValidation.touched.title
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Section title"
                />
                {sectionFormValidation.errors.title && sectionFormValidation.touched.title && (
                  <p className="text-red-500 text-sm mt-1">{sectionFormValidation.errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Section subtitle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (JSON format for flexible data)
                </label>
                <textarea
                  value={sectionForm.content}
                  onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder='Example: {"text": "Welcome message", "buttonText": "Learn More", "buttonUrl": "/about"}'
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sectionActive"
                    checked={sectionForm.isActive}
                    onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sectionActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionModal(false);
                    resetSectionForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  <FaSave className="mr-2" />
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured Product Modal */}
      {showFeaturedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Featured Product' : 'Add Featured Product'}
            </h2>
            <form onSubmit={handleFeaturedSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  value={featuredForm.productId}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a product</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={featuredForm.title}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Override product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Description (Optional)
                </label>
                <textarea
                  value={featuredForm.description}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Override product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={featuredForm.imageUrl}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Override product image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={featuredForm.order}
                    onChange={(e) => setFeaturedForm({ ...featuredForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featuredActive"
                    checked={featuredForm.isActive}
                    onChange={(e) => setFeaturedForm({ ...featuredForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featuredActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeaturedModal(false);
                    resetFeaturedForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  <FaSave className="mr-2" />
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Training Program Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Training Program' : 'Add Training Program'}
            </h2>
            <form onSubmit={handleTrainingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Title
                </label>
                <input
                  type="text"
                  value={trainingForm.title}
                  onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., GIS Fundamentals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={trainingForm.description}
                  onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  placeholder="Detailed description of the training program"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={trainingForm.duration}
                    onChange={(e) => setTrainingForm({ ...trainingForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., 3 days, 2 weeks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={trainingForm.level}
                    onChange={(e) => setTrainingForm({ ...trainingForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={trainingForm.price}
                    onChange={(e) => setTrainingForm({ ...trainingForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={trainingForm.currency}
                    onChange={(e) => setTrainingForm({ ...trainingForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (comma-separated)
                </label>
                <textarea
                  value={trainingForm.features}
                  onChange={(e) => setTrainingForm({ ...trainingForm, features: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="e.g., Hands-on exercises, Certificate included, Expert instructors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={trainingForm.imageUrl}
                  onChange={(e) => setTrainingForm({ ...trainingForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Program image URL"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students (Optional)
                  </label>
                  <input
                    type="number"
                    value={trainingForm.maxStudents || ''}
                    onChange={(e) => setTrainingForm({ ...trainingForm, maxStudents: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    placeholder="No limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={trainingForm.order}
                    onChange={(e) => setTrainingForm({ ...trainingForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trainingActive"
                    checked={trainingForm.isActive}
                    onChange={(e) => setTrainingForm({ ...trainingForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trainingActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrainingModal(false);
                    resetTrainingForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  <FaSave className="mr-2" />
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}