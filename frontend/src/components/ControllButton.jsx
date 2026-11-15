export default function ControllButton({
  children,
  onClick = () => {},
  bgColor = "#2D8A60",
  hoverColor = "#236F4C",
  textColor = "#FFFFFF",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        "--button-bg": bgColor,
        "--hover-bg": hoverColor,
        color: textColor,
      }}
      className="
        cursor-pointer px-5 py-3
        text-sm font-semibold
        bg-[var(--button-bg)]
        hover:bg-[var(--hover-bg)]
        rounded-none
        transition-colors duration-200
        disabled:opacity-40
        disabled:cursor-not-allowed
      "
    >
      {children}
    </button>
  );
}
