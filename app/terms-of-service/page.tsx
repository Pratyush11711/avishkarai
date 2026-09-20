import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import document from "@/content/legal/terms-of-service.json";

export const metadata: Metadata = {
  title: "Terms of Service | Avishkar AI",
  description: "Terms governing access to and use of the Avishkar AI website.",
};

export default function TermsOfServicePage() {
  return <LegalPage document={document} />;
}
