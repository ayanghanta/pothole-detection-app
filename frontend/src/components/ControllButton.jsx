export default function ControllButton({ children, onClick = () => "", type }) {
  let className = "";
  return (
    <button
      onClick={onClick}
      className="cursor-pointer px-3 py-1.5 text-lg text-slate-50 bg-blue-500 rounded-md"
    >
      {children}
    </button>
  );
}
