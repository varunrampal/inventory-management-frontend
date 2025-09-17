import defaultLogo from "../assets/logo.png";
import gfnLogo from "../assets/gfn-logo.png";
import pnpLogo from "../assets/pnp-logo.png";

const LOGOS = {
  // map by whatever you pass as companyId
  peels: pnpLogo,
  greenflow: gfnLogo,
  "9341454894464212": pnpLogo,   // realm IDs if you prefer
  "123146276399949": gfnLogo
};



export default function CompanyLogo({ companyId, height = "30mm", className = "w-auto", style }) {
 const base = import.meta.env.BASE_URL || "/";
 console.log(`Rendering logo for company: ${companyId} at ${base}assets/${companyId}.png`);

 const src = LOGOS[String(companyId)?.trim().toLowerCase()] || LOGOS[companyId] || defaultLogo;
  return (
    <img
       src={src}
      alt="Company Logo"
      className={className}
      style={{ height, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", ...style }}
      onError={(e) => {
        if (e.currentTarget.src !== defaultLogo) e.currentTarget.src = defaultLogo;
      }}
    />
  );
}