"use client";
import { I18nProvider } from "@/lib/i18n/context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { usePathname } from "next/navigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <I18nProvider>
      {!isAdmin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </I18nProvider>
  );
}
