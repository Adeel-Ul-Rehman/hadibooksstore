import React from "react";
import { motion } from "framer-motion";
import Title from "../components/Title";
import TeamMember from "../components/TeamMember";
import { assets } from "../assets/assets";

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

const About = () => {
  const team = [
    {
      id: 1,
      name: "Hadeed Haider (Hadi)",
      role: "Founder & CEO",
      bio: "Book enthusiast with over 5 years in the books industry.",
      image: assets.hadi,
    },
    {
      id: 2,
      name: "Adeel Ul Rehman",
      role: "Head of Operations",
      bio: "Ensures our books reach you in perfect condition and on time.",
      image: assets.adeel,
    },
    {
      id: 3,
      name: "Abdullah Gujjer",
      role: "Head Buyer",
      bio: "Curates our collection to bring you the best books available.",
      image: assets.abd,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="min-h-screen py-8 px-4 sm:px-6 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 font-['Poppins',sans-serif]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          variants={fadeUp}
          custom={0.1}
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Title text1="OUR" text2="STORY" />
          <motion.p
            variants={fadeUp}
            custom={0.3}
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-4 text-lg text-gray-800 max-w-3xl mx-auto"
          >
            At Hadi Books Store, we believe every book is a doorway ✨ to
            knowledge, to imagination, and to worlds waiting to be discovered.
          </motion.p>
        </motion.div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-20">
          <motion.div
            variants={scaleIn}
            custom={0.2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col justify-center h-96"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-gray-800 mb-4">
              To connect readers with books that inspire, educate, and
              entertain. We believe in the transformative power of reading and
              strive to make quality literature accessible to everyone.
            </p>
            <p className="text-gray-800">
              Our carefully curated selection includes everything from timeless
              classics to contemporary bestsellers, ensuring there's something
              for every type of reader.
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            custom={0.4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-96"
          >
            <img
              src={assets.shop}
              alt="Our Mission"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h3 className="text-white text-xl font-bold">
                Curating Knowledge Since 2010
              </h3>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          variants={fadeUp}
          custom={0.2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality",
                description:
                  "We source only the best books from reputable publishers and authors.",
                icon: "⭐",
              },
              {
                title: "Community",
                description:
                  "We support local authors and host book clubs to foster reading communities.",
                icon: "🤝",
              },
              {
                title: "Sustainability",
                description:
                  "We use eco-friendly packaging and support book recycling programs.",
                icon: "🌱",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                variants={scaleIn}
                custom={index * 0.2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white shadow-sm border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 p-6"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-800">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          variants={fadeUp}
          custom={0.3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeUp}
                custom={index * 0.2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <TeamMember member={member} index={index} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default About;
