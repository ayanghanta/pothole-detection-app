export default function LiveStat({
  title,
  value,
  description,
  icon: Icon,
  accentColor = "#52B788",
}) {
  return (
    <div className="bg-white border border-[#E2EAE3] p-2.5 flex items-center gap-2">
      <div
        className="w-8 h-8 flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${accentColor}18`,
          color: accentColor,
        }}
      >
        {Icon && <Icon size={15} />}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-bold tracking-wide text-[#89958D]">
          {title}
        </p>
        <p className="text-[12px] font-bold text-[#26352D] mt-0.5">{value}</p>
        {description && (
          <p className="text-[9px] text-[#87958B] mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
