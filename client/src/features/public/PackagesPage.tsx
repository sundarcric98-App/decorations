import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Package } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const PackagesPage: React.FC = () => {
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['public-packages-all'],
    queryFn: () => api.get<Package[]>('/packages'),
  });

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Tailored Event Collections</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#24211F]">
          Wedding & Celebration Packages
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77716B]">
          Complete, hassle-free event bundles crafted by master decorators. All packages can be customized for your venue dimensions and specific rituals.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingSpinner message="Loading wedding packages..." fullHeight />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                variant={pkg.isFeatured ? 'bordered' : 'default'}
                className={`flex flex-col justify-between p-8 relative ${
                  pkg.isFeatured ? 'bg-white shadow-luxury-lg border-2 border-[#B8955A]' : 'bg-[#FAF7F2]'
                }`}
              >
                {pkg.isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#B8955A] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#24211F]">{pkg.name}</h3>
                    <p className="text-xs text-[#77716B] mt-2 leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="py-4 border-y border-[#E8E0D6] flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-[#77716B] uppercase font-bold tracking-wider block">
                        Estimated Investment
                      </span>
                      <div className="font-serif text-3xl font-bold text-[#B8955A] mt-0.5">
                        {pkg.packagePrice ? `₹${Number(pkg.packagePrice).toLocaleString('en-IN')}` : 'Custom Quote'}
                      </div>
                    </div>
                    <span className="text-xs text-[#77716B] font-semibold">{pkg.pricingType}</span>
                  </div>

                  {/* Included Services */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase text-[#24211F] tracking-wider block">
                      Core Package Inclusions:
                    </span>
                    <ul className="space-y-2.5 text-xs text-[#56504A]">
                      {(pkg.includedServices || []).map((serviceName, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#24845D] shrink-0 mt-0.5" />
                          <span className="leading-tight">{serviceName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optional Extras */}
                  {pkg.optionalExtras && pkg.optionalExtras.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <span className="text-[11px] font-bold uppercase text-[#77716B] tracking-wider block">
                        Available Add-ons:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.optionalExtras.map((extra, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white text-[#56504A] px-2 py-0.5 rounded-md border border-[#E8E0D6] flex items-center gap-1"
                          >
                            <Plus className="w-2.5 h-2.5 text-[#B8955A]" /> {extra}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  {pkg.terms && (
                    <p className="text-[10px] text-gray-400 italic">
                      * {pkg.terms}
                    </p>
                  )}
                </div>

                <div className="pt-8">
                  <Link to={`/book-event?package=${pkg.slug}`} className="w-full block">
                    <Button
                      variant={pkg.isFeatured ? 'gold' : 'primary'}
                      size="md"
                      className="w-full"
                    >
                      Book This Package
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Custom Bespoke Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 sm:p-12 border border-[#E8E0D6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <Badge variant="gold">Need Something Unique?</Badge>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#24211F]">
              Have a Specific Theme or Celebrity Stage in Mind?
            </h3>
            <p className="text-sm text-[#77716B] leading-relaxed">
              We create 100% bespoke designs with 3D renders, custom laser cut backdrops, specific exotic flower imports, and specialized LED architecture.
            </p>
          </div>
          <Link to="/book-event">
            <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Build Custom Package
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
