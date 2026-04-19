export default function Loading() {
  return (
    <div className="fixed inset-0 z-[1000] bg-body/80 backdrop-blur-md flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated Inner Circle */}
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        
        {/* Pulsing Outer Glow */}
        <div className="absolute inset-0 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-heading text-primary animate-pulse tracking-wide">Friendly UI</h2>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}