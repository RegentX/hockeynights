import {Route, Routes} from 'react-router-dom'
import {screen, waitFor} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {TrainingDetailsPage} from '@/features/events/TrainingDetailsPage'
import {renderWithProviders} from '@/test/render'

describe('TrainingDetailsPage', () => {
  it('opens training page by route and shows contact/prepay blocks', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/events/trainings/:eventId" element={<TrainingDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/events/trainings/event-005']}},
    )

    await waitFor(() => {
      expect(screen.getByText('Публичная тренировка 2-сторонка')).toBeInTheDocument()
      expect(screen.getByText('Контакты организатора')).toBeInTheDocument()
      expect(screen.getByText('Внести предоплату (скоро)')).toBeInTheDocument()
    })
  })
})
