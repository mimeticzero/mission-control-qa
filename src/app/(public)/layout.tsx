export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Prevent white flash — body defaults to white; all public pages are dark */}
      <style>{`body { background: #030508 !important; }`}</style>
      {children}
    </>
  )
}
