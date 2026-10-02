import React, { useState } from "react";
import { motion } from "framer-motion";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Construct mailto link with form data
    const recipient = "hadibooksstore@gmail.com";
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Message from: ${formData.name}\n\n${formData.message}`
    );
    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

    // Open the user's default email client
    window.location.href = mailtoLink;

    // Simulate submission process
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Title text1="GET IN" text2="TOUCH" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base sm:text-lg text-gray-800 max-w-3xl mx-auto"
          >
            Have questions or feedback? We'd love to hear from you. Fill out the
            form below or reach out through our contact information.
          </motion.p>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Phone
                </h3>
                <p className="text-sm text-gray-800">
                  +92 3090005634
                </p>
                <p className="text-sm text-gray-800 mt-1">
                  Mon-Sun: 9am-6pm
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Email
                </h3>
                <p className="text-sm text-gray-800">
                  hadibooksstore@gmail.com
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Address
                </h3>
                <p className="text-sm text-gray-800">
                  Sarwar Market Main Urdu Bazaar
                </p>
                <p className="text-sm text-gray-800">
                  Lahore, Pakistan
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form and Visit Store */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Send us a message */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col min-h-fit max-h-[400px]"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
              Send us a message
            </h2>

            {submitSuccess && (
              <div className="mb-3 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                Your email client has been opened. Please send the email to submit your message.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
              <div className="space-y-3 flex-grow">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium text-gray-900 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-orange-600 focus:border-orange-600 transition-all duration-200 text-sm text-gray-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs font-medium text-gray-900 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-orange-600 focus:border-orange-600 transition-all duration-200 text-sm text-gray-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-medium text-gray-900 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-8 border border-gray-300 rounded-md focus:ring-orange-600 focus:border-orange-600 transition-all duration-200 text-sm text-gray-800"
                  ></textarea>
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-[160px] py-2 cursor-pointer bg-[#00308F] hover:bg-[#002570] text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label={isSubmitting ? "Opening Email" : "Send Message"}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-2 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Opening Email...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Visit Our Store */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col h-[400px] p-4"
          >
            <img
              src={assets.shop1}
              alt="Our Location"
              className="w-full h-64 object-cover"
            />
            <div className="flex flex-col justify-between flex-grow mt-2">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Visit Our Store
                </h3>
                <p className="text-sm text-gray-800 mb-2">
                  Come browse our physical collection at our flagship store in
                  Story City.
                </p>
              </div>
              <a
                href="https://maps.app.goo.gl/c9aXiLstVma81ytg8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-[160px] py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-sm font-medium transition-all duration-300 text-center"
              >
                Get Directions
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;