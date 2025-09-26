export default function UpcomingWeekMini({ data }) {
  if (!data?.grouped?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {data.grouped.map((g) => (
        <div key={g.shipDay} className="rounded-xl border p-3">
          <div className="text-xs text-gray-500">{g.shipDay}</div>
          <div className="text-xl font-semibold">{g.count}</div>
        </div>
      ))}
    </div>
  );
}