export default function ControllButton({
  children,
  onClick = () => {},
  bgColor = "bg-blue-500",
  textColor = "text-white",
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-3 py-1.5 text-lg ${bgColor} ${textColor} rounded-none`}
    >
      {children}
    </button>
  );
}
