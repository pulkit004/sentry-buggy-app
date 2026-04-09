"use client";

/**
 * BUG 5: XSS via dangerouslySetInnerHTML.
 *
 * This component renders analytics report HTML from an API response
 * using dangerouslySetInnerHTML without any sanitization.
 * If the API response contains <script> tags or event handlers,
 * they will execute in the user's browser.
 */

import { useState, useEffect } from "react";

interface AnalyticsReport {
  title: string;
  html: string;
  generatedAt: string;
}

// Simulates an API response that could contain malicious HTML
function getMockAnalyticsReport(): AnalyticsReport {
  return {
    title: "Weekly Analytics Report",
    // BUG: This HTML contains an injected script tag
    html: `
      <h2>Traffic Summary</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;">Page Views</td><td style="padding: 8px; border: 1px solid #ddd;">12,450</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;">Unique Visitors</td><td style="padding: 8px; border: 1px solid #ddd;">3,280</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;">Bounce Rate</td><td style="padding: 8px; border: 1px solid #ddd;">42.5%</td></tr>
      </table>
      <p>Top referrer: <span style="color: blue;">google.com</span></p>
      <img src="x" onerror="console.error('XSS: onerror handler executed')" />
      <div onmouseover="console.error('XSS: onmouseover executed')">Hover me for XSS</div>
    `,
    generatedAt: new Date().toISOString(),
  };
}

export default function AnalyticsPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const data = getMockAnalyticsReport();
    setReport(data);
  }, []);

  if (!report) {
    return <p>Loading analytics...</p>;
  }

  return (
    <main>
      <h1>{report.title}</h1>
      <p style={{ color: "#666", fontSize: "0.875rem" }}>
        Generated: {report.generatedAt}
      </p>

      {/* BUG: Rendering unsanitized HTML from an API response */}
      <div dangerouslySetInnerHTML={{ __html: report.html }} />

      <p style={{ color: "#999", marginTop: "2rem", fontSize: "0.75rem" }}>
        Report HTML is rendered without sanitization. In production, this
        would allow XSS attacks if the API is compromised.
      </p>
    </main>
  );
}
