/**
 * HOCFRONT-28G / ORG-4-5 — wizard create, edit stub, club entry
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {selectMockPersona} from '@/mocks/data/session'
import {CreateEventPage} from '@/pages/CreateEventPage'
import {EditTrainingPage} from '@/pages/EditTrainingPage'
import {routes} from '@/shared/const/appRoutes'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-28G create wizard / edit stub', () => {
  beforeEach(() => {
    clearTestStorage()
    selectMockPersona('organizer')
  })

  it('saves draft without subscription gate', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.eventsCreate} element={<CreateEventPage />} />
      </Routes>,
      {routerProps: {initialEntries: [routes.eventsCreate]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-panel')).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText('Название'), 'Черновик утро')

    for (let i = 0; i < 4; i += 1) {
      await user.click(screen.getByTestId('events-create-form-btn-next'))
    }

    await screen.findByTestId('events-create-form-btn-draft')
    await user.click(screen.getByTestId('events-create-form-btn-draft'))

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-text-success')).toHaveTextContent('Черновик')
    })
  })

  it('prefills private_club access from query and shows club badge', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.eventsCreate} element={<CreateEventPage />} />
      </Routes>,
      {routerProps: {initialEntries: [`${routes.eventsCreate}?access=private_club`]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-panel')).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText('Название'), 'Клубная закрытая')
    await user.click(screen.getByTestId('events-create-form-btn-next'))
    await user.click(screen.getByTestId('events-create-form-btn-next'))
    await user.click(screen.getByTestId('events-create-form-btn-next'))

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-text-private-badge')).toBeInTheDocument()
    })
  })

  it('opens edit stub for training', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.trainingEdit} element={<EditTrainingPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/events/trainings/event-002/edit']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-edit-page-page-event-002')).toBeInTheDocument()
      expect(screen.getByTestId('events-edit-page-text-stub')).toBeInTheDocument()
    })
  })
})
