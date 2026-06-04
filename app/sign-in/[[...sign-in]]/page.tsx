import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: "bg-white text-black hover:bg-white/90",
          card: "bg-slate-900 border border-white/10 text-white"
        }
      }} />
    </div>
  );
}