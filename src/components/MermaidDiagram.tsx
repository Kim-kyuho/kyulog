"use client";

import { useEffect, useId, useState } from "react";

export default function MermaidDiagram({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/:/g, "")}`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
        });

        const { svg: renderedSvg } = await mermaid.render(id, chart);

        if (!cancelled) {
          setSvg(renderedSvg);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setSvg("");
          setError("Mermaid diagram could not be rendered.");
        }
      }
    };

    const timer = window.setTimeout(renderDiagram, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [chart, id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div
      className="mermaid-diagram my-4 w-full max-w-none overflow-x-auto rounded-sm bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
