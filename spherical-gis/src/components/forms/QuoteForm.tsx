'use client';

import { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaFileAlt, FaPaperPlane } from 'react-icons/fa';
import { useFormValidation, commonRules } from '@/lib/hooks/useFormValidation';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { formatNaira } from '@/lib/utils/currency';

interface QuoteFormProps {
  onSuccess?: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useErrorHandler();

  const { values, errors, isValid, setValue, reset } = useFormValidation({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: ''
  }, {
    name: {
      label: 'Name',
      rules: { ...commonRules.name }
    },
    email: {
      label: 'Email',
      rules: { ...commonRules.email }
    },
    phone: {
      label: 'Phone',
      rules: { required: true, minLength: 10 }
    },
    company: {
      label: 'Company',
      rules: { required: true }
    },
    location: {
      label: 'Location',
      rules: { required: true }
    },
    projectType: {
      label: 'Project Type',
      rules: { required: true }
    },
    budget: {
      label: 'Budget',
      rules: { required: true }
    },
    timeline: {
      label: 'Timeline',
      rules: { required: true }
    },
    description: {
      label: 'Description',
      rules: { required: true, minLength: 20 }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast.error('Please fix all form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request');
      }

      toast.success('Quote request submitted successfully! We\'ll get back to you soon.');
      reset();
      onSuccess?.();
    } catch (error) {
      handleError(error, 'Failed to submit quote request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <FaUser className="inline mr-2" />
            Full Name
          </label>
          <Input
            type="text"
            id="name"
            value={values.name}
            onChange={(e) => setValue('name', e.target.value)}
            className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <FaEnvelope className="inline mr-2" />
            Email Address
          </label>
          <Input
            type="email"
            id="email"
            value={values.email}
            onChange={(e) => setValue('email', e.target.value)}
            className={errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            <FaPhone className="inline mr-2" />
            Phone Number
          </label>
          <Input
            type="tel"
            id="phone"
            value={values.phone}
            onChange={(e) => setValue('phone', e.target.value)}
            className={errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="Enter your phone number"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            <FaBuilding className="inline mr-2" />
            Company/Organization
          </label>
          <Input
            type="text"
            id="company"
            value={values.company}
            onChange={(e) => setValue('company', e.target.value)}
            className={errors.company ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="Enter your company name"
          />
          {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
        </div>
      </div>

      {/* Project Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-2" />
            Project Location
          </label>
          <Input
            type="text"
            id="location"
            value={values.location}
            onChange={(e) => setValue('location', e.target.value)}
            className={errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="Enter project location"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>

        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
            Project Type
          </label>
          <select
            id="projectType"
            value={values.projectType}
            onChange={(e) => setValue('projectType', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
              errors.projectType ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          >
            <option value="">Select project type</option>
            <option value="mapping">GIS Mapping</option>
            <option value="analysis">Spatial Analysis</option>
            <option value="database">Database Development</option>
            <option value="web-app">Web Application</option>
            <option value="mobile-app">Mobile Application</option>
            <option value="consulting">Consulting Services</option>
            <option value="training">Training & Education</option>
            <option value="other">Other</option>
          </select>
          {errors.projectType && <p className="mt-1 text-sm text-red-600">{errors.projectType}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range
          </label>
          <select
            id="budget"
            value={values.budget}
            onChange={(e) => setValue('budget', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
              errors.budget ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          >
            <option value="">Select budget range</option>
            <option value="under-2.5m">Under ₦2,500,000</option>
            <option value="2.5m-7.5m">₦2,500,000 - ₦7,500,000</option>
            <option value="7.5m-25m">₦7,500,000 - ₦25,000,000</option>
            <option value="25m-50m">₦25,000,000 - ₦50,000,000</option>
            <option value="over-50m">Over ₦50,000,000</option>
          </select>
          {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
            Project Timeline
          </label>
          <select
            id="timeline"
            value={values.timeline}
            onChange={(e) => setValue('timeline', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
              errors.timeline ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          >
            <option value="">Select timeline</option>
            <option value="asap">ASAP</option>
            <option value="1-3-months">1-3 months</option>
            <option value="3-6-months">3-6 months</option>
            <option value="6-12-months">6-12 months</option>
            <option value="over-1-year">Over 1 year</option>
          </select>
          {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline}</p>}
        </div>
      </div>

      {/* Project Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          <FaFileAlt className="inline mr-2" />
          Project Description
        </label>
        <textarea
          id="description"
          rows={6}
          value={values.description}
          onChange={(e) => setValue('description', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
            errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="Please describe your project requirements, goals, and any specific features you need..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Request...
            </>
          ) : (
            <>
              <FaPaperPlane className="mr-2" />
              Request Quote
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;