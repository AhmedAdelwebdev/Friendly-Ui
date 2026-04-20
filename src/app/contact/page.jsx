import { MessageCircle, MapPin } from 'lucide-react';

export default function ContactPage() {

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
                icon={<MessageCircle size={20} />} 
                title="Telegram" 
                value="@Friendly_Ui" 
                href="https://t.me/Friendly_Ui"
              />
              <ContactInfoCard 
                icon={<MapPin size={20} />} 
                title="Location" 
                value="َQena, Egypt" 
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
