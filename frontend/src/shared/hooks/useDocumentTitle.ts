import {useEffect} from 'react'

const APP_NAME = 'Hockey Nights'

/** Устанавливает `document.title` для страницы и восстанавливает базовый при размонтировании. */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${pageTitle} · ${APP_NAME}`
    return () => {
      document.title = previousTitle
    }
  }, [pageTitle])
}
