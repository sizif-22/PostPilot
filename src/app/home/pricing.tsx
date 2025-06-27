import { CheckIcon } from "lucide-react";
import { motion } from "framer-motion";

export const Pricing = () => {
  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for individuals and small creators",
      features: [
        "3 social media accounts",
        "30 scheduled posts/month",
        "Basic analytics",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for growing businesses and agencies",
      features: [
        "10 social media accounts",
        "Unlimited scheduled posts",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
        "AI content suggestions",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large organizations with advanced needs",
      features: [
        "Unlimited accounts",
        "Unlimited posts",
        "Custom analytics",
        "Advanced team features",
        "24/7 phone support",
        "API access",
        "Custom integrations",
      ],
      popular: false,
    },
  ];
  return (
    <section className="py-16 sm:py-24 px-6 dark:bg-gradient-to-b dark:from-violet-950/20 dark:to-black bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-gray-900 mb-6">
            Choose Your{" "}
            <span className="dark:bg-gradient-to-r dark:from-violet-400 dark:to-white bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h3>
          <p className="text-lg dark:text-zinc-400 text-gray-700 max-w-2xl mx-auto">
            Start for free and scale as you grow. No hidden fees, cancel
            anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "dark:bg-gradient-to-b dark:from-violet-900/50 dark:to-violet-950/50 bg-gradient-to-b from-violet-100 to-violet-50 dark:border-violet-500 border-violet-400 border-2"
                  : "dark:bg-violet-950/30 bg-white/70 dark:border-violet-800/30 border-violet-200/30 border"
              } backdrop-blur-sm hover:scale-105 transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="dark:bg-violet-600 bg-violet-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">
                  {plan.name}
                </h4>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold dark:text-violet-400 text-violet-700">
                    {plan.price}
                  </span>
                  <span className="dark:text-zinc-400 text-gray-600">
                    {plan.period}
                  </span>
                </div>
                <p className="dark:text-zinc-400 text-gray-600 text-sm">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 dark:text-violet-400 text-violet-700 mt-0.5 flex-shrink-0" />
                    <span className="dark:text-zinc-300 text-gray-700 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "dark:bg-violet-600 bg-violet-700 text-white hover:dark:bg-violet-500 hover:bg-violet-600"
                    : "dark:border-violet-600 border-violet-700 border-2 dark:text-violet-400 text-violet-700 hover:dark:bg-violet-600/10 hover:bg-violet-700/10"
                }`}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
