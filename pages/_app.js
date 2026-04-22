import { useEffect } from 'react'
import { useRouter } from 'next/router'
import scrollIntoView from 'scroll-into-view-if-needed'
import '../styles/globals.css'
import '../styles/scalar.css'

function SidebarActiveScroll() {
  const router = useRouter()
  useEffect(() => {
    const scrollActiveIntoView = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const container = document.querySelector(
            'aside.nextra-sidebar-container'
          )
          if (!container) return
          const actives = container.querySelectorAll('li.active')
          const target = actives[actives.length - 1]
          if (!target) return
          scrollIntoView(target, {
            scrollMode: 'if-needed',
            block: 'center',
            inline: 'nearest',
            boundary: container,
          })
        })
      })
    }
    scrollActiveIntoView()
    router.events.on('routeChangeComplete', scrollActiveIntoView)
    return () => {
      router.events.off('routeChangeComplete', scrollActiveIntoView)
    }
  }, [router.events])
  return null
}

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <SidebarActiveScroll />
      <Component {...pageProps} />
      <script
        src="//instant.page/5.2.0"
        type="module"
        integrity="sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z"
      ></script>
    </>
  )
}
