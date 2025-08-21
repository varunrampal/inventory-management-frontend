import defaultLogo from "../assets/logo.png";

export default function CompanyLogo({ companyId, height = "30mm", className = "w-auto", style }) {
 const base = import.meta.env.BASE_URL || "/";
 console.log(`Rendering logo for company: ${companyId} at ${base}assets/${companyId}.png`);
  return (
    <img
       src={`/logos/${companyId}.png`}
      alt="Company Logo"
      className={className}
      style={{ height, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", ...style }}
      onError={(e) => {
        if (e.currentTarget.src !== defaultLogo) e.currentTarget.src = defaultLogo;
      }}
    />
  );
}