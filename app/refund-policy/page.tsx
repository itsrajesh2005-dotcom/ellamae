import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function RefundPolicy() {
  return (
    <>
      <Navbar variant="light" />
      <main className="min-h-screen bg-[#faf6f0] pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-light text-zinc-900 mb-8">Refund & Cancellation Policy</h1>
          <div className="prose prose-zinc prose-a:text-gold max-w-none text-zinc-700 leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>At Ellamae Gifts, we want you to be completely satisfied with your purchase. This policy outlines our guidelines for refunds and cancellations.</p>
            
            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">1. Customized Products</h2>
            <p>Because customized products are created specifically for you, they are <strong>non-refundable and non-returnable</strong> once the order has been processed. Please ensure all customization details are correct before placing your order.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">2. Non-Customized Products</h2>
            <p>For standard, non-customized items, we accept returns within 7 days of delivery, provided the item is unused and in its original packaging. Shipping costs for returns are the responsibility of the customer.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">3. Damaged or Defective Items</h2>
            <p>If your order arrives damaged or defective, please contact us within 48 hours of delivery with photographic evidence. We will arrange for a replacement or a full refund at our discretion.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">4. Cancellations</h2>
            <p>Orders can only be cancelled within 24 hours of placement, provided the processing or customization has not yet begun. Once an order is in production, it cannot be cancelled.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">5. Contact Us</h2>
            <p>To initiate a return or report a damaged item, please contact our support team at ellamae.azstore@gmail.com or via WhatsApp at +91 9790666769.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
