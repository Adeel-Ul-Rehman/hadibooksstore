import React from 'react';
import { motion } from 'framer-motion';

const TeamMember = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white shadow-md border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300"
    >
      {/* Bigger Image Section */}
      <div className="h-80 overflow-hidden">
        <img 
          src={member.image} 
          alt={member.name}
          className="w-full h-80 object-cover object-top transition-transform duration-500 hover:scale-110"
        />
      </div>

      {/* Details Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
        <p className="text-gray-700 font-medium mb-1">{member.role}</p>
        <p className="text-gray-600 text-sm">{member.bio}</p>
      </div>
    </motion.div>
  );
};

export default TeamMember;
