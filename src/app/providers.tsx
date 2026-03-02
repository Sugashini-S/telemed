"use client";

import { I18nProvider } from "@/lib/i18n/context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <I18nProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </I18nProvider>
    );
}
