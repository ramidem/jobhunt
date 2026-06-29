"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { PDFDownloadLinkProps } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import type { Resume } from "@/lib/resume-schema";

export function ResumePdfDownload({ resume }: { resume: Resume }) {
  const [pdf, setPdf] = useState<{
    PDFDownloadLink: ComponentType<PDFDownloadLinkProps>;
    document: PDFDownloadLinkProps["document"];
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPdfRenderer() {
      const [{ PDFDownloadLink }, { ResumePdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/resume-pdf-document"),
      ]);

      if (!mounted) {
        return;
      }

      setPdf({
        PDFDownloadLink,
        document: <ResumePdfDocument resume={resume} />,
      });
    }

    loadPdfRenderer();

    return () => {
      mounted = false;
    };
  }, [resume]);

  if (!pdf) {
    return (
      <button className="icon-button" disabled type="button">
        <Download aria-hidden="true" size={17} />
        Preparing PDF
      </button>
    );
  }

  const PdfDownloadLink = pdf.PDFDownloadLink;

  return (
    <PdfDownloadLink
      className="icon-button"
      document={pdf.document}
      fileName={`${resume.name.toLowerCase().replaceAll(" ", "-")}-resume.pdf`}
    >
      {({ loading }) => (
        <>
          <Download aria-hidden="true" size={17} />
          {loading ? "Preparing PDF" : "Download PDF"}
        </>
      )}
    </PdfDownloadLink>
  );
}
