export default function SplashScreen() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#0F1115] flex flex-col items-center justify-center gap-4 z-50 select-none">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] to-[#80AAFF] flex items-center justify-center text-lg font-black text-white shadow-lg shadow-blue-500/20">
        S
      </div>
      <div className="flex items-center gap-2 text-[#A0A6B1]">
        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#4F8CFF] animate-spin" />
        <span className="text-xs font-medium tracking-wide">Loading The Shak Space…</span>
      </div>
    </div>
  );
}
