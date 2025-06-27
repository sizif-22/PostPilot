import { motion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/outline";
export const Testimonial = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "TechStart Inc.",
      content:
        "PostPilot has transformed our social media strategy. We've seen a 300% increase in engagement since switching.",
      avatar: "/avatar1.jpg",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Content Creator",
      company: "Independent",
      content:
        "The AI-powered content suggestions are incredible. I save hours every week on content creation.",
      avatar: "/avatar2.jpg",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Social Media Director",
      company: "Fashion Forward",
      content:
        "The analytics insights help us understand our audience better and create more targeted content.",
      avatar: "/avatar3.jpg",
      rating: 5,
    },
  ];
  return (
    <section className="py-16 sm:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900 mb-6">
            What Our{" "}
            <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h3>
          <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their
            social media strategy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="dark:bg-violet-950/30 bg-white/70 backdrop-blur-sm rounded-2xl p-6 dark:border-violet-800/30 border-violet-200/30 border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className="w-5 h-5 dark:text-violet-400 text-violet-700 fill-current"
                  />
                ))}
              </div>

              <p className="dark:text-zinc-300 text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 dark:bg-violet-600/20 bg-violet-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold dark:text-violet-400 text-violet-700">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h5 className="font-semibold dark:text-white text-gray-900">
                    {testimonial.name}
                  </h5>
                  <p className="text-sm dark:text-zinc-400 text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
