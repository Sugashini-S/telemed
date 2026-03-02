"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { key: "stats_patients" as const, value: "12,500+" },
  { key: "stats_doctors" as const, value: "85" },
  { key: "stats_appointments" as const, value: "32,000+" },
  { key: "stats_districts" as const, value: "15" },
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sage-100 via-white to-sage-50">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sage-200/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sage-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-sage-100 border border-sage-200 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-sage-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-sage-700">
                Serving Rural Tamil Nadu
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-sage-900 leading-tight mb-6">
              {t("hero_title")}
            </h1>

            <p className="text-lg md:text-xl text-sage-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("hero_subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/doctors">
                <Button
                  size="lg"
                  className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white px-8 py-6 text-base shadow-lg shadow-sage-600/25 hover:shadow-xl hover:shadow-sage-600/30 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("hero_cta")}
                </Button>
              </Link>
              <Link href="/doctors">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-sage-300 text-sage-700 hover:bg-sage-100 px-8 py-6 text-base"
                >
                  {t("hero_cta_secondary")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-sage-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.key} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-sage-200">{t(stat.key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sage-900 mb-4">
              How It Works
            </h2>
            <p className="text-sage-600 max-w-xl mx-auto">
              Simple, accessible healthcare booking designed for rural communities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="rounded-xl border-sage-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sage-200 transition-colors">
                  <svg className="w-7 h-7 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-sage-900 mb-3">
                  {t("feature_1_title")}
                </h3>
                <p className="text-sage-600 leading-relaxed">
                  {t("feature_1_desc")}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="rounded-xl border-sage-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sage-200 transition-colors">
                  <svg className="w-7 h-7 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-sage-900 mb-3">
                  {t("feature_2_title")}
                </h3>
                <p className="text-sage-600 leading-relaxed">
                  {t("feature_2_desc")}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="rounded-xl border-sage-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sage-200 transition-colors">
                  <svg className="w-7 h-7 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-sage-900 mb-3">
                  {t("feature_3_title")}
                </h3>
                <p className="text-sage-600 leading-relaxed">
                  {t("feature_3_desc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sage-100 to-sage-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-sage-900 mb-4">
            Ready to Book Your Appointment?
          </h2>
          <p className="text-lg text-sage-600 mb-8 max-w-xl mx-auto">
            Join thousands of patients who have simplified their healthcare journey
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white px-10 py-6 text-base shadow-lg shadow-sage-600/25"
            >
              Get Started — It&apos;s Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
