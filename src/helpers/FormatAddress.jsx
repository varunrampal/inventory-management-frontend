export default function formatQBOAddress(addr) {
  if (!addr) return "";

  // Collect free-form lines first (Line1..Line5)
  const lines = [];
  ["Line1", "Line2", "Line3", "Line4", "Line5"].forEach((k) => {
    if (addr[k]) lines.push(addr[k]);
  });

  // City/Region + Postal
  const cityRegion = [addr.City, addr.CountrySubDivisionCode].filter(Boolean).join(", ");
  const cityPostal = [cityRegion, addr.PostalCode].filter(Boolean).join(" ");

  // Country (optional)
  const country = addr.Country;

  return [...lines, cityPostal, country].filter(Boolean).join("\n");
}