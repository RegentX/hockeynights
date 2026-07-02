/**
 * SPEC-FR-2.1.1
 * Текст условий использования — общий блок для модалки и мини-страницы.
 */

import {
  TERMS_OF_USE_SECTIONS,
  TERMS_OF_USE_TITLE,
  TERMS_OF_USE_VERSION,
} from '@/features/auth/termsOfUseContent'
import {testId} from '@/shared/testing/testId'

export function TermsOfUseDocument() {
  return (
    <article className="terms-doc" data-testid={testId('auth', 'terms', 'panel', 'document')}>
      <header className="terms-doc__header" data-testid={testId('auth', 'terms', 'panel', 'header')}>
        <h2 className="terms-doc__title" data-testid={testId('auth', 'terms', 'text', 'title')}>
          {TERMS_OF_USE_TITLE}
        </h2>
        <p className="terms-doc__meta" data-testid={testId('auth', 'terms', 'text', 'version')}>
          Версия от {TERMS_OF_USE_VERSION} · Hockey Nights
        </p>
        <p className="terms-doc__lead" data-testid={testId('auth', 'terms', 'text', 'lead')}>
          Документ оформлен по принципу пользовательских соглашений мессенджеров: короткие разделы,
          понятные обязательства и правила сообщества.
        </p>
      </header>

      <div className="terms-doc__body" data-testid={testId('auth', 'terms', 'panel', 'body')}>
        {TERMS_OF_USE_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={`terms-${section.id}`}
            className="terms-doc__section"
            data-testid={testId('auth', 'terms', 'section', section.id)}
          >
            <h3
              className="terms-doc__section-title"
              data-testid={testId('auth', 'terms', 'text', 'section-title', section.id)}
            >
              {section.title}
            </h3>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="terms-doc__paragraph"
                data-testid={testId('auth', 'terms', 'text', 'paragraph', section.id, index)}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}
