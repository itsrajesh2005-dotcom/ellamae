import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsAndConditions() {
  return (
    <>
      <Navbar variant="light" />
      <main className="min-h-screen bg-[#faf6f0] pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-light text-zinc-900 mb-8">Terms & Conditions</h1>
          <div className="prose prose-zinc prose-a:text-gold max-w-none text-zinc-700 leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Welcome to Ellamae Gifts. These terms and conditions outline the rules and regulations for the use of our website.</p>
            
            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Ellamae Gifts if you do not agree to take all of the terms and conditions stated on this page.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">2. Customization & Orders</h2>
            <p>All customized orders are final. Please double-check spellings, dates, and other custom details before finalizing your order. We are not responsible for customer errors in spelling or dates.</p>
            
            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">3. Pricing and Availability</h2>
            <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the service.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">4. Shipping & Delivery</h2>
            <p>Delivery times are estimates and commence from the date of shipping, rather than the date of order. Delivery times are to be used as a guide only and are subject to the acceptance and approval of your order.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">5. Contact Information</h2>
            <p>Questions about the Terms of Service should be sent to us at ellamae.azstore@gmail.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
