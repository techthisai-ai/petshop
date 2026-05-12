"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Fish,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import { faqs } from "@/lib/data";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Our Store",
    details: ["Rainbow Aqua and Pets", "No. 45, South Car Street", "Tirunelveli Town - 627006, Tamil Nadu"],
    color: "text-coral",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+91 98765 43210", "+91 22 1234 5678"],
    color: "text-secondary",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["hello@aquapethaven.in", "support@aquapethaven.in"],
    color: "text-accent",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Sat: 10:00 AM - 8:00 PM", "Sunday: 11:00 AM - 6:00 PM"],
    color: "text-primary",
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Message Sent! 📬",
      description: "We'll get back to you within 24 hours.",
      variant: "success",
    });

    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">CONTACT US</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-white/80 text-lg">
              Have questions about our cloned fish or need expert advice? We&apos;re here to help!
              Visit our store in Mumbai or reach out online.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border p-6 text-center"
              >
                <div className={`inline-flex p-3 rounded-full bg-muted mb-4 ${info.color}`}>
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {detail}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-secondary" />
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="How can we help?"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tell us more..."
                  />
                </div>
                <Button
                  type="submit"
                  variant="ocean"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <Fish className="w-6 h-6 text-secondary" />
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-display font-bold mb-2">Find Our Store</h2>
            <p className="text-muted-foreground">
              Visit us at our flagship store in Mumbai
            </p>
          </motion.div>
          <div className="rounded-xl overflow-hidden border h-[400px] bg-muted flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-secondary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Interactive map would be displayed here
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Andheri West, Mumbai 400058
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

