import React from "react";
import ContactForm from "../../components/forms/ContactForm/ContactForm";

const ContactPage = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600">
          Have questions? We're here to help. Reach out to our team.
        </p>
      </div>

      <ContactForm />
    </main>
  );
};

export default ContactPage;
