'use client';

import { Mail, MessageCircle, Send, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate sending
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading text-gray-900">Get in Touch</h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Have a project in mind? Or just want to say hello? I'd love to hear from you. 
            Fill out the form below or reach out via social media.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Info Side */}
          <div className="md:col-span-1 space-y-8">
            <div className="space-y-6">
              <ContactInfoCard 
                icon={<Mail size={20} />} 
                title="Email" 
                value="friendlyui.ahmed@gmail.com" 
                href="mailto:friendlyui.ahmed@gmail.com"
              />
              <ContactInfoCard 
                icon={<MessageCircle size={20} />} 
                title="Telegram" 
                value="@Friendly_Ui" 
                href="https://t.me/Friendly_Ui"
              />
              <ContactInfoCard 
                icon={<MapPin size={20} />} 
                title="Location" 
                value="Alexandria, Egypt" 
              />
            </div>

            {/* Support Box */}
            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <h3 className="font-heading text-primary mb-2">Customer Support</h3>
              <p className="text-xs text-primary/70 font-medium">
                For order-related issues, please contact us via Telegram for faster resolution.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-2 bg-white dark:bg-card rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                  <Send size={32} />
                </div>
                <h2 className="text-2xl font-heading text-gray-900">Message Sent!</h2>
                <p className="text-gray-500 font-medium">
                  Thanks for reaching out! I'll get back to you as soon as possible.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-primary font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-body border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-body border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                  <select className="w-full px-5 py-4 bg-gray-50 dark:bg-body border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer text-gray-700">
                    <option>General Inquiry</option>
                    <option>Custom UI Project</option>
                    <option>Order Support</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tell me about your project..."
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-body border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 resize-none"
                  ></textarea>
                </div>

                <button 
                  disabled={status === 'loading'}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactInfoCard({ icon, title, value, href }) {
  const Card = href ? 'a' : 'div';
  return (
    <Card 
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      className={`block p-5 bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm transition-all ${href ? 'hover:border-primary/30 hover:-translate-y-1' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{title}</p>
          <p className="text-sm text-gray-900 font-medium truncate max-w-[180px]">{value}</p>
        </div>
      </div>
    </Card>
  );
}
