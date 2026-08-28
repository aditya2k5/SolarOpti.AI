import React, { useEffect, useRef, useState } from "react";
import { Phone, Mail, Send, User, Mail as MailIcon, MessageSquare } from "lucide-react";
import emailjs from '@emailjs/browser';

const CtaSection = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    emailjs.sendForm(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      formRef.current
    ).then(() => {
      setStatus('✅ Message sent!');
      formRef.current.reset();
    }).catch((error) => {
      setStatus('❌ Failed: ' + error.text);
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <section className="py-16 md:py-24 bg-transparent transition-colors duration-300">
      <div className="section-container max-w-4xl mx-auto px-4">
        <div className="card p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Contact <span className="gradient-text">SolarOpti.AI</span>
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            Solar yield, ROI, tilt optimization help.
          </p>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            <a href="tel:+917907552520" className="card flex items-center justify-center gap-3 px-6 py-4 text-[var(--text-primary)] hover:text-[#10B981] transition-colors">
              <Phone className="h-5 w-5 text-[#10B981]" /><span>+91 7907552520</span>
            </a>
            <a href="mailto:Adityabhattb2005@gmail.com" className="card flex items-center justify-center gap-3 px-6 py-4 text-[var(--text-primary)] hover:text-[#10B981] transition-colors">
              <Mail className="h-5 w-5 text-[#10B981]" /><span>Adityabhattb2005@gmail.com</span>
            </a>
          </div>

          {/* Email Form */}
          <form ref={formRef} onSubmit={sendEmail} className="max-w-lg mx-auto space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-[#10B981]" /> Name
              </label>
              <input 
                name="name" 
                required 
                className="w-full p-3 bg-[var(--background)] border border-[var(--border-emerald)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[#10B981] focus:outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-[#10B981]" /> Email
              </label>
              <input 
                name="user_email" 
                type="email" 
                required 
                className="w-full p-3 bg-[var(--background)] border border-[var(--border-emerald)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[#10B981] focus:outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#10B981]" /> Message
              </label>
              <textarea 
                name="message" 
                rows="4" 
                required 
                className="w-full p-3 bg-[var(--background)] border border-[var(--border-emerald)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[#10B981] focus:outline-none transition-all" 
              />
            </div>
            
           
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              <Send className="h-5 w-5" />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {status && (
            <p className={`mt-4 text-sm font-medium ${status.includes('✅') ? 'text-[#10B981]' : 'text-orange-500'}`}>
              {status}
            </p>
          )}

          <p className="mt-6 text-sm text-[var(--text-muted)]">
            Available: Mon–Sat, 10 AM – 6 PM IST
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;