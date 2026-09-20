import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import document from "@/content/legal/privacy-policy.json";

export const metadata: Metadata = {
  title: "Privacy Policy | Avishkar AI",
  description: "How Avishkar AI collects, uses and protects personal data, and how to contact us about your rights.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage document={document} />;
}
