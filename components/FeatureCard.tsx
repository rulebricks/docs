import React from 'react'
import Link from 'next/link'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  href,
}: FeatureCardProps) {
  return (
    <Link href={href} className="feature-card group block">
      <div className="h-full">
        {/* Icon at top - larger and fainter */}
        <div className="text-neutral-300 dark:text-neutral-800 mb-auto group-hover:text-lime-700 dark:group-hover:text-lime-300 transition-colors">
          {icon}
        </div>
        {/* Text at bottom */}
        <div className="mt-auto pt-6">
          <h3 className="text-xl font-light text-neutral-900 dark:text-white mb-0.5 group-hover:text-lime-700 dark:group-hover:text-lime-300 transition-colors">
            {title}
          </h3>
          <p className="text-base text-neutral-600 dark:text-neutral-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
