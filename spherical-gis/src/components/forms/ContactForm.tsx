'use client';

import { useFormValidation, commonRules } from '@/lib/hooks/useFormValidation';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { FaUser, FaEnvelope, FaPhone, FaComment, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  onSubmitSuccess?: () => void;
}

export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const { handleError } = useErrorHandler();

  const initialValues: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  };

  const formConfig = {
    name: {
      rules: {
        ...commonRules.name,
        minLength: 2,
        maxLength: 50,
      },
      label: 'Full Name',
    },
    email: {
      rules: {
        ...commonRules.email,
      },
      label: 'Email Address',
    },
    phone: {
      rules: {
        required: true,
        minLength: 10,
        maxLength: 15,
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
      },
      label: 'Phone Number',
    },
    subject: {
      rules: {
        required: true,
        minLength: 5,
        maxLength: 100,
      },
      label: 'Subject',
    },
    message: {
      rules: {
        required: true,
        minLength: 10,
        maxLength: 1000,
      },
      label: 'Message',
    },
  };

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setTouched,
    handleSubmit,
    reset,
  } = useFormValidation(initialValues, formConfig);

  const onFormSubmit = handleSubmit(async (formData: ContactFormData) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
      onSubmitSuccess?.();
    } catch (error) {
      handleError(error, 'Failed to send message');
    }
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          <FaUser className="inline mr-2 text-green-600" />
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          onBlur={() => setTouched('name')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
            errors.name && touched.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && touched.name && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          <FaEnvelope className="inline mr-2 text-green-600" />
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={values.email}
          onChange={(e) => setValue('email', e.target.value)}
          onBlur={() => setTouched('email')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
            errors.email && touched.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter your email address"
        />
        {errors.email && touched.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          <FaPhone className="inline mr-2 text-green-600" />
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          value={values.phone}
          onChange={(e) => setValue('phone', e.target.value)}
          onBlur={() => setTouched('phone')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
            errors.phone && touched.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter your phone number"
        />
        {errors.phone && touched.phone && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {errors.phone}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          <FaComment className="inline mr-2 text-green-600" />
          Subject *
        </label>
        <input
          type="text"
          id="subject"
          value={values.subject}
          onChange={(e) => setValue('subject', e.target.value)}
          onBlur={() => setTouched('subject')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
            errors.subject && touched.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="What is this regarding?"
        />
        {errors.subject && touched.subject && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          <FaComment className="inline mr-2 text-green-600" />
          Message *
        </label>
        <textarea
          id="message"
          rows={6}
          value={values.message}
          onChange={(e) => setValue('message', e.target.value)}
          onBlur={() => setTouched('message')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors resize-vertical ${
            errors.message && touched.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Please provide details about your inquiry..."
        />
        {errors.message && touched.message && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {errors.message}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {values.message.length}/1000 characters
        </p>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="h-5 w-5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </div>

      {/* Form Status */}
      <div className="text-center text-sm text-gray-600">
        <p>We typically respond within 24 hours</p>
      </div>
    </form>
  );
}