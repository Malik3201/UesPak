interface JsonLdScriptsProps {
  data: object | object[];
}

export default function JsonLdScripts({ data }: JsonLdScriptsProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
