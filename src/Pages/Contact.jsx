import React, { useState } from 'react';
import {
  User, Mail, MessageCircle, CheckCircle, Send, Sparkles, Clock, AlertCircle,
} from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const getFieldValidation = (field, value) => {
    switch (field) {
      case 'email':
        if (!value.trim()) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
        return null;
      case 'name':
        if (!value.trim()) return "Name is required.";
        if (value.trim().length < 2) return "Name must be at least 2 characters long.";
        return null;
      case 'message':
        if (!value.trim()) return "Message is required.";
        if (value.trim().length < 10) return "Message must be at least 10 characters long.";
        return null;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    ['name', 'email', 'message'].forEach(field => {
      const error = getFieldValidation(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      alert("An error occurred while sending your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = getFieldValidation(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setFocusedField(null);
  };

  const isFilled = (value) => value.trim() !== '';

  const renderFormField = (name, type = 'text', icon, placeholder, isTextArea = false) => {
    const IconComponent = icon;
    return (
      <div key={name} className="group mb-3">
        <div className="relative">
          <div className={`absolute left-4 ${isTextArea ? 'top-6' : 'top-1/2 -translate-y-1/2'} z-10`}>
            <IconComponent className={`w-5 h-5 transition-all duration-300 ${
              focusedField === name || isFilled(formData[name])
                ? 'text-emerald-500 scale-110'
                : 'text-gray-400'
            }`} />
          </div>
          {isTextArea ? (
            <textarea
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onFocus={() => setFocusedField(name)}
              onBlur={handleBlur}
              rows={4}
              className={`peer w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-md border-2 rounded-xl text-gray-900 placeholder-transparent focus:outline-none transition-all duration-300 text-base shadow-sm hover:shadow-lg focus:shadow-emerald-200 resize-none
                ${errors[name]
                  ? 'border-red-400 focus:border-red-500 bg-red-100/40'
                  : focusedField === name
                    ? 'border-emerald-500 shadow-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'}`}
              placeholder={placeholder}
            />
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onFocus={() => setFocusedField(name)}
              onBlur={handleBlur}
              className={`peer w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-md border-2 rounded-xl text-gray-900 placeholder-transparent focus:outline-none transition-all duration-300 text-base shadow-sm hover:shadow-lg focus:shadow-emerald-100
                ${errors[name]
                  ? 'border-red-400 focus:border-red-500 bg-red-100/40'
                  : focusedField === name
                    ? 'border-emerald-500 shadow-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              placeholder={placeholder}
            />
          )}
          <label
            htmlFor={name}
            className={`absolute left-12 px-2 bg-white/90 backdrop-blur transition-all duration-300 pointer-events-none font-medium ${
              focusedField === name || isFilled(formData[name]) ? '-top-2 text-xs' : 'top-4 text-base'
            } ${
              errors[name]
                ? 'text-red-500'
                : focusedField === name || isFilled(formData[name])
                  ? 'text-emerald-600'
                  : 'text-gray-500'
            } peer-focus:-top-2 peer-focus:text-xs
            ${errors[name] ? 'peer-focus:text-red-500' : 'peer-focus:text-emerald-600'}`}
          >
            {placeholder}
          </label>
          <div className={`absolute right-4 ${isTextArea ? 'top-6' : 'top-1/2 -translate-y-1/2'}`}>
            {errors[name] ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isFilled(formData[name]) && getFieldValidation(name, formData[name]) === null ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : null}
          </div>
        </div>
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderFormField('name', 'text', User, 'Your Name')}
      {renderFormField('email', 'email', Mail, 'Your Email')}
      {renderFormField('message', 'text', MessageCircle, 'Your Message', true)}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || submitted}
        className="group relative w-full bg-gradient-to-r from-emerald-500/90 to-lime-400/90 hover:from-emerald-600 hover:to-lime-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.015] disabled:opacity-70"
      >
        <div className="flex items-center justify-center gap-3 relative z-20">
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : submitted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Message Sent!</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              <span>Send Message</span>
            </>
          )}
        </div>
        {!isLoading && !submitted && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-700 z-0" />
        )}
      </button>
      {submitted && (
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <span className="text-green-700 font-medium">Thank you! We'll get back to you soon.</span>
        </div>
      )}
    </div>
  );
};

function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white/60 to-emerald-100/60 px-4 py-12 sm:py-16 overflow-x-hidden select-none">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          {/* Sidebar Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-lime-400 rounded-2xl shadow-md mb-4">
                <Sparkles className="w-8 h-8 text-white drop-shadow" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-lime-700 bg-clip-text text-transparent mb-3 leading-tight">
                Contact Us
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-full mb-4"></div>
              <p className="text-lg text-green-800/90 leading-relaxed">
                Have questions or need help? We'd love to hear from you.<br />
                Fill out the form and we'll respond quickly.
              </p>
            </div>
            <div className="space-y-4">
              <div className="group p-4 bg-white/70 backdrop-blur-md rounded-xl border border-green-200 hover:border-lime-300 ring-1 ring-inset ring-white/20 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Email Us</h3>
                    <a href="mailto:support@civix.com" className="text-emerald-600 hover:text-lime-700 transition-colors font-medium">
                      support@civix.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="group p-4 bg-white/70 backdrop-blur-md rounded-xl border border-green-200 hover:border-lime-300 ring-1 ring-inset ring-white/20 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-lime-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Response Time</h3>
                    <p className="text-green-700 font-medium">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-lime-100/30 rounded-xl border border-lime-200/50 ring-1 ring-inset ring-white/20">
              <h3 className="text-base font-semibold text-emerald-800 mb-2">Why Contact Us?</h3>
              <ul className="space-y-1 text-sm text-emerald-700">
                {[
                  "Technical support and assistance",
                  "Feature requests and feedback",
                  "General inquiries and questions",
                ].map((txt, idx) => (
                  <li key={txt} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-lime-600" />
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl ring-1 ring-inset ring-emerald-100 border border-emerald-100 p-8 md:p-10">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-emerald-700 mb-1">Send us a Message</h2>
                <p className="text-green-700/80">We'll respond as quickly as possible</p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
