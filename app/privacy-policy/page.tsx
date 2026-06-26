import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar variant="light" />
      <main className="min-h-screen bg-[#faf6f0] pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-light text-zinc-900 mb-8">Privacy Policy</h1>
          <div className="prose prose-zinc prose-a:text-gold max-w-none text-zinc-700 leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Welcome to Ellamae Gifts. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
            
            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
            </ul>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">3. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.</p>

            <h2 className="text-xl font-medium text-zinc-900 mt-8 mb-4">4. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
            <p className="mt-2">Email: ellamae.azstore@gmail.com<br/>Phone: +91 9790666769</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
