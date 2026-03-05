"use client";

import { useTranslation } from "@/lib/i18n/context";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-sage-600 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-white/90">{t("footer_text")}</p>
                    </div>
                    <p className="text-xs text-white/60">{t("footer_made")}</p>
                </div>
            </div>
          <div className="text-center py-2 border-t border-white/10"><a href="/admin" className="text-xs text-white/40 hover:text-white/70 transition-colors">Admin Panel</a></div>
</footer>
    );
}
