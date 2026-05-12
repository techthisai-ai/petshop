"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  Navigation as NavigationIcon,
  Phone,
  Search,
  Store,
  X,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stores = [
  {
    name: "Rainbow Aqua and Pets - Tirunelveli",
    city: "Tirunelveli",
    area: "Tirunelveli Town",
    address: "No. 45, South Car Street, Tirunelveli Town - 627006, Tamil Nadu",
    phone: "+91 98765 43210",
    hours: "Mon - Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 6:00 PM",
    services: ["Live fish", "Aquarium setup", "Pet food", "Accessories"],
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=No.%2045%20South%20Car%20Street%20Tirunelveli%20Town%20627006",
  },
  {
    name: "Rainbow Aqua and Pets - Chennai",
    city: "Chennai",
    area: "T. Nagar",
    address: "Bazaar Street, T. Nagar, Chennai 600017",
    phone: "+91 98765 43211",
    hours: "Mon - Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 6:00 PM",
    services: ["Aquarium fish", "Bird supplies", "Tank maintenance", "Accessories"],
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=T%20Nagar%20Chennai%20600017",
  },
  {
    name: "Rainbow Aqua and Pets - Coimbatore",
    city: "Coimbatore",
    area: "RS Puram",
    address: "DB Road, RS Puram, Coimbatore 641002",
    phone: "+91 98765 43212",
    hours: "Mon - Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 6:00 PM",
    services: ["Freshwater fish", "Aquarium plants", "Filters", "Pet care"],
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=RS%20Puram%20Coimbatore%20641002",
  },
  {
    name: "Rainbow Aqua and Pets - Salem",
    city: "Salem",
    area: "Five Roads",
    address: "Five Roads Junction, Salem 636004",
    phone: "+91 98765 43213",
    hours: "Mon - Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 6:00 PM",
    services: ["Marine fish", "Fish food", "Aquarium service", "Pet supplies"],
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Five%20Roads%20Salem%20636004",
  },
];

export default function StoresPage() {
  const [query, setQuery] = useState("");

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return stores;

    return stores.filter((store) => {
      const searchableText = [
        store.name,
        store.city,
        store.area,
        store.address,
        store.phone,
        store.hours,
        ...store.services,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="bg-gradient-to-r from-primary to-ocean-dark text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="secondary" className="mb-4">
              STORE LOCATOR
            </Badge>
            <h1 className="font-display text-4xl font-bold md:text-5xl">
              Find a Rainbow Aqua Store
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Search by city, area, pincode, or service to find the nearest store for
              fish, pets, food, accessories, and aquarium support.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, area, pincode, or service"
                className="h-12 pl-12 pr-12"
                aria-label="Search stores"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Clear store search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Showing {filteredStores.length} of {stores.length} stores
            </p>
          </div>

          {filteredStores.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredStores.map((store, index) => (
                <motion.article
                  key={store.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{store.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {store.area}, {store.city}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className="flex gap-3 text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-coral" />
                      <span>{store.address}</span>
                    </p>
                    <a
                      href={`tel:${store.phone.replace(/\s/g, "")}`}
                      className="flex gap-3 text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                      <span>{store.phone}</span>
                    </a>
                    <p className="flex gap-3 text-muted-foreground">
                      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                      <span>{store.hours}</span>
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {store.services.map((service) => (
                      <Badge key={service} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button variant="ocean" asChild>
                      <a href={store.mapUrl} target="_blank" rel="noopener noreferrer">
                        <NavigationIcon className="mr-2 h-4 w-4" />
                        Get Directions
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">
                        Contact Store
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">No stores found</h2>
              <p className="mt-2 text-muted-foreground">
                Try another city, area, pincode, or service. You can also contact us
                and we will help you find the closest store.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button onClick={() => setQuery("")}>Clear Search</Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
