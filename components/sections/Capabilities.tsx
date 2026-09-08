"use client";

import { motion } from "framer-motion";

const CAPABILITIES = [
  {
    category: "Product",
    items: [
      "Product strategy",
      "Scope definition",
      "Technical architecture",
      "Design systems",
      "UI and UX design",
      "Prototyping",
    ],
  },
  {
    category: "Engineering",
    items: [
      "0→1 products and MVPs",
      "Multi-tenant SaaS platforms",
      "Mobile apps, iOS and Android",
      "API design and integration",
      "Data modeling and migrations",
      "Infrastructure as code",
    ],
  },
  {
    category: "Applied AI",
    items: [
      "Voice agents",
      "Document intelligence",
      "Computer vision",
      "Agentic workflows",
      "Model integration and evaluation",
    ],
  },
  {
    category: "Platform",
    items: [
      "Compliance architecture, HIPAA-grade",
      "Security and access control",
      "Observability and monitoring",
      "Platform rescues and codebase audits",
      "App store submission",
    ],
  },
  {
    category: "Partnership",
    items: [
      "Embedded product teams",
      "Ongoing engineering retainers",
      "Team augmentation on a defined workstream",
    ],
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="section-pad" aria-label="Capabilities">
      <div className="page-wrap">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.category}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className="bg-paper-white rounded-[32px] p-6"
            >
              <h3 className="type-heading-sm text-carbon-black mb-4 uppercase tracking-tight">
                {cap.category}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {cap.items.map((item, j) => (
                  <li key={j} className="type-body-sm text-slate flex items-start gap-2">
                    <span className="mt-[6px] w-1 h-1 rounded-full bg-ash shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
