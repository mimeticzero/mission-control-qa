export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Prevent white flash — body defaults to white; all public pages are dark */}
      <style>{`body { background: #0d0f14 !important; }`}</style>
      {children}
    </>
  )
}
